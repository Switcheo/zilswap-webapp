import { BigNumber } from 'bignumber.js'
import { call, delay, fork, put, race, select, take, takeLatest } from "redux-saga/effects";
import { toBech32Address } from "@zilliqa-js/zilliqa";
import { Distribution, Distributor, EstimatedRewards, ZAPStats, logger, ArkClient, TbmFeeDistributionEntry, TbmFeeDistribution } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";
import { actions } from "app/store";
import { BlockchainActionTypes } from "app/store/blockchain/actions";
import { RewardsActionTypes } from "app/store/rewards/actions";
import { DistributionWithStatus, DistributorWithTimings, PoolReward, PotentialRewards } from "app/store/types";
import { WalletActionTypes } from "app/store/wallet/actions";
import { bnOrZero, SimpleMap } from "app/utils";
import { PollIntervals, WZIL_TOKEN_CONTRACT, ZERO_ADDRESS } from "app/utils/constants";
import { getBlockchain, getRewards, getTokens, getWallet, getMarketplace } from "../selectors";

function* queryDistributors() {
  while (true) {
    logger("zap saga", "query distributors");
    const { network } = getBlockchain(yield select())
    const { tokens } = getTokens(yield select())

    try {
      const distributors: ReadonlyArray<Distributor> = yield ZAPStats.getDistributionInfo({ network })
      const distrWithTimings: DistributorWithTimings[] = []

      logger("query distributors: ", distributors);

      const rewards: SimpleMap<PoolReward[]> = {};
      for (const tokenAddress in tokens) {
        rewards[tokenAddress] = []
      }

      const cache: { [range: string]: SimpleMap<BigNumber> } = {}
      for (const distributor of distributors) {
        const {
          incentivized_pools, distributor_name,
          reward_token_address_hex, emission_info,
        } = distributor
        const {
          distribution_start_time, epoch_period,
          tokens_per_epoch, developer_token_ratio_bps,
          total_number_of_epochs, initial_epoch_number,
        } = emission_info

        const endTime = distribution_start_time + (total_number_of_epochs * epoch_period);
        const now = Math.floor(Date.now() / 1000)
        const ended = endTime < now;

        const epochs_completed = Math.floor(Math.max(0, now - distribution_start_time) / epoch_period)
        const from = ended ? -1 : distribution_start_time + (epochs_completed * epoch_period)
        const until = ended ? -1 : from + epoch_period
        const finalEpochNumber = initial_epoch_number + total_number_of_epochs;

        distrWithTimings.push({ ...distributor, currentEpochStart: from, currentEpochEnd: until, finalEpochNumber })
        if (ended)
          continue;

        // cache identical epoch ranges
        const key = `${from}-${until}`
        const poolsWeightedLiquidity: SimpleMap<BigNumber> = cache[key] ?? (yield ZAPStats.getWeightedLiquidity({ network, from, until }))
        cache[key] = poolsWeightedLiquidity

        const rewardToken = tokens[toBech32Address(reward_token_address_hex)]
        const totalWeight = Object.values(incentivized_pools).reduce((prev, cur) => prev + cur, 0)
        const totalAmount = new BigNumber(tokens_per_epoch.replace(/_/g, '')).times(10000 - developer_token_ratio_bps).div(10000)
        for (const tokenAddress in tokens) {
          if (totalWeight === 0) continue

          const amountPerEpoch = totalAmount.times(incentivized_pools[tokenAddress] ?? 0).div(totalWeight)

          if (amountPerEpoch.isZero()) {
            continue
          }

          const weightedLiquidity = new BigNumber(poolsWeightedLiquidity[tokenAddress] || 0);
          rewards[tokenAddress].push({
            distributorName: distributor_name,
            rewardToken,
            currentEpochStart: from,
            currentEpochEnd: until,
            amountPerEpoch,
            weightedLiquidity,
          })
        }
      }

      yield put(actions.Rewards.updatePoolRewards(rewards));
      yield put(actions.Rewards.updateDistributors(distrWithTimings));
    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      const invalidated = yield race({
        minutePoll: delay(PollIntervals.Distributors),
        networkUpdate: take(BlockchainActionTypes.SET_NETWORK),
      });

      logger("zap saga", "distributors invalidated", invalidated);
    }
  }
}

function* queryDistribution() {
  while (true) {
    try {
      logger("zap saga", "query distributions");

      const { network } = getBlockchain(yield select())
      const { distributors } = getRewards(yield select())
      const walletState = getWallet(yield select())

      if (!walletState.wallet) {
        yield put(actions.Rewards.updateDistributions([]));
        continue;
      }

      const d: ReadonlyArray<Distribution> = yield ZAPStats.getClaimableDistributions({
        address: walletState.wallet.addressInfo.bech32,
        network,
      });

      type Substate = { merkle_roots: { [epoch_number: string]: string } }
      const uploadStates: { [distributor_address: string]: Substate } = {}
      const distributions: DistributionWithStatus[] = []
      const zilswap = ZilswapConnector.getSDK();
      for (let i = 0; i < d.length; ++i) {
        const info = d[i]
        const addr = info.distributor_address;
        if (info.distributor_address === "0x940c02e471a082cc3062b7cc446e652e64fe13fe" && info.epoch_number === 3)
          continue;

        let uploadState = uploadStates[addr]
        if (!uploadState) {
          const contract = zilswap.getContract(addr);
          uploadStates[addr] = uploadState = yield call([contract, contract.getSubState], "merkle_roots");
        }
        const merkleRoots = uploadState?.merkle_roots ?? {};

        let funded = null;
        const distributor = distributors.find(d => d.distributor_address_hex === addr && d.finalEpochNumber >= info.epoch_number);
        if (distributor) {
          // check if reward_token_address_hex is ZIL address
          let tokenBalance;
          if (distributor.reward_token_address_hex === ZERO_ADDRESS) {
            // reward is in ZIL, fetch _balance from distributor instead
            const distributorContract = zilswap.getContract(addr);
            const ZILBalanceState = yield call([distributorContract, distributorContract.getSubState], "_balance");
            tokenBalance = ZILBalanceState._balance;
          } else {
            // reward is a ZRC-2, fetch balance from rewardTokenContract state
            const tokenContract = zilswap.getContract(distributor.reward_token_address_hex);
            const balancesState = yield call([tokenContract, tokenContract.getSubState], "balances");
            tokenBalance = balancesState.balances[addr];
          }

          if (tokenBalance) {
            funded = bnOrZero(tokenBalance).gte(info.amount);
          } else {
            funded = true;
          }
        }

        distributions.push({
          info,
          readyToClaim: typeof merkleRoots[info.epoch_number] === "string",
          funded,
        })
      }

      yield put(actions.Rewards.updateDistributions(distributions));

    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      const invalidated = yield race({
        networkUpdate: take(BlockchainActionTypes.SET_NETWORK),
        distributorsUpdated: take(RewardsActionTypes.UPDATE_DISTRIBUTORS),
        walletUpdated: take(WalletActionTypes.WALLET_UPDATE),
      });

      logger("zap saga", "epoch info invalidated", invalidated);
    }
  }
}

function* queryTbmFeeDistributionEntry() {
  const zilCurrency = "0x0000000000000000000000000000000000000000";
  while (true) {
    try {
      logger("rewards saga", "query TBM fee distributions");

      const { network } = getBlockchain(yield select())
      const { exchangeInfo } = getMarketplace(yield select())
      const walletState = getWallet(yield select())
      const arkClient = new ArkClient(network);
      const feeDistributors = exchangeInfo?.feeDistributors;

      if (!walletState.wallet || !feeDistributors) {
        continue;
      }

      const userAddress = walletState.wallet?.addressInfo.byte20;
      const userAddressBech32 = walletState.wallet?.addressInfo.bech32.toLowerCase();
      const result = (yield call(arkClient.getTbmFeeDistributionEntries, userAddressBech32)) as unknown as any;
      const entries: TbmFeeDistributionEntry[] = result.entries;

      const userClaimables = entries.filter((e) => e.userAddress.toLowerCase() === userAddress.toLowerCase() && e.amount > 0 && !e.claimed);

      const d: TbmFeeDistribution[] = userClaimables.map((c) => {
        return {
          id: c.id,
          distributor_address: feeDistributors[c.currencyAddress],
          epoch_number: c.tbmFeeDistributionRoot.epochNumber,
          amount: new BigNumber(c.amount),
          proof: c.proof,
          reward_token_address: c.currencyAddress,
          epoch: c.tbmFeeDistributionRoot.epoch
        }
      })

      type Substate = { merkle_roots: { [epoch_number: string]: string } }
      const uploadStates: { [distributor_address: string]: Substate } = {}
      const distributions: DistributionWithStatus[] = []
      const zilswap = ZilswapConnector.getSDK();
      for (let i = 0; i < d.length; ++i) {
        const info = d[i]
        const addr = info.distributor_address
        let uploadState = uploadStates[addr]
        if (!uploadState) {
          const contract = zilswap.getContract(addr);
          uploadStates[addr] = uploadState = yield call([contract, contract.getSubState], "merkle_roots");
        }
        const merkleRoots = uploadState?.merkle_roots ?? {};

        let funded = null;
        let tokenAddress = info.reward_token_address;

        if (info.reward_token_address === zilCurrency) tokenAddress = WZIL_TOKEN_CONTRACT[network]

        const tokenContract = zilswap.getContract(tokenAddress);
        const balancesState = (yield call([tokenContract, tokenContract.getSubState], "balances")) as unknown as any
        const tokenBalance = balancesState.balances[addr];

        if (tokenBalance) {
          funded = bnOrZero(tokenBalance).gte(info.amount);
        } else {
          funded = true;
        }

        distributions.push({
          info,
          readyToClaim: typeof merkleRoots[info.epoch_number] === "string",
          funded,
          isTbmFee: true
        })
      }

      yield put(actions.Rewards.appendDistributions(distributions));

    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      const invalidated = yield race({
        networkUpdate: take(BlockchainActionTypes.SET_NETWORK),
        distributionsUpdated: take(RewardsActionTypes.UPDATE_DISTRIBUTIONS),
        walletUpdated: take(WalletActionTypes.WALLET_UPDATE),
      });

      logger("rewards saga", "TBM fee distributions epoch info invalidated", invalidated);
    }
  }
}

function* queryPotentialRewards() {
  while (true) {
    logger("zap saga", "query potential rewards");
    try {
      const { network } = getBlockchain(yield select())
      const { wallet } = getWallet(yield select())
      const { distributors } = getRewards(yield select())

      if (!wallet) {
        yield put(actions.Rewards.updatePotentialRewards({}));
        continue;
      }

      const estRewards: EstimatedRewards = yield ZAPStats.getEstimatedRewards({
        address: wallet.addressInfo.bech32,
        network,
      });

      const rewardsByPool: PotentialRewards = {}
      Object.entries(estRewards).forEach(([distributorAddress, rewards]) => {
        const d = distributors.find(d => d.distributor_address_hex === distributorAddress)
        if (!d) return
        Object.entries(rewards).forEach(([poolAddress, amount]) => {
          if (poolAddress === 'developer') return
          if (!rewardsByPool[poolAddress]) rewardsByPool[poolAddress] = []
          const tokenAddress = toBech32Address(d.reward_token_address_hex)
          const i = rewardsByPool[poolAddress].findIndex(r => r.tokenAddress === tokenAddress)
          if (i < 0) {
            rewardsByPool[poolAddress] = rewardsByPool[poolAddress].concat({ tokenAddress, amount: new BigNumber(amount) })
          } else {
            rewardsByPool[poolAddress][i].amount = rewardsByPool[poolAddress][i].amount.plus(amount)
          }
        })
      })

      yield put(actions.Rewards.updatePotentialRewards(rewardsByPool));
    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      const invalidated = yield race({
        distributorsUpdated: take(RewardsActionTypes.UPDATE_DISTRIBUTORS),
        walletUpdated: take(WalletActionTypes.WALLET_UPDATE),
      });

      logger("zap saga", "epoch info invalidated", invalidated);
    }
  }
}

function* watchDistributors() {
  yield takeLatest([
    actions.Rewards.RewardsActionTypes.UPDATE_DISTRIBUTORS,
  ], queryDistribution);
}

export default function* rewardsSaga() {
  logger("init rewards saga");
  yield take(BlockchainActionTypes.INITIALIZED) // wait for first init
  yield fork(queryDistributors);
  yield fork(queryDistribution);
  yield fork(queryPotentialRewards);
  yield fork(queryTbmFeeDistributionEntry);
  yield fork(watchDistributors);
}
