import { BigNumber } from 'bignumber.js'
import { call, delay, fork, put, race, select, take } from "redux-saga/effects";
import { toBech32Address } from "@zilliqa-js/zilliqa";
import { actions } from "app/store";
import { BlockchainActionTypes } from "app/store/blockchain/actions";
import { RewardsActionTypes } from "app/store/rewards/actions";
import { DistributorWithTimings, DistributionWithStatus, PoolReward, PotentialRewards } from "app/store/types";
import { WalletActionTypes } from "app/store/wallet/actions";
import { SimpleMap } from "app/utils";
import { PollIntervals } from "app/utils/constants";
import { logger, ZAPStats, Distribution, Distributor, EstimatedRewards } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";
import { getWallet, getTokens, getRewards, getBlockchain } from "../selectors";

function* queryDistributors() {
  while (true) {
    logger("zap saga", "query distributors");
    const { network } = getBlockchain(yield select())
    const { tokens } = getTokens(yield select())

    try {
      const distributors: ReadonlyArray<Distributor> = yield ZAPStats.getDistributionInfo({ network })
      const distrWithTimings: DistributorWithTimings[] = []

      const rewards: SimpleMap<PoolReward[]> = {};
      for (const tokenAddress in tokens) {
        rewards[tokenAddress] = []
      }

      const cache: { [range: string]: SimpleMap<BigNumber> } = {}
      for (const distributor of distributors) {
        const {
          incentivized_pools, distributor_name,
          reward_token_address_hex, emission_info
        } = distributor
        const {
          distribution_start_time, epoch_period,
          tokens_per_epoch, developer_token_ratio_bps
        } = emission_info
        const now = Math.floor(Date.now() / 1000)
        const epochs_completed = Math.floor(Math.max(0, now - distribution_start_time) / epoch_period)
        const from = distribution_start_time + (epochs_completed * epoch_period)
        const until = from + epoch_period

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

        distrWithTimings.push({ ...distributor, currentEpochStart: from, currentEpochEnd: until })
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
        const addr = info.distributor_address
        let uploadState = uploadStates[addr]
        if (!uploadState) {
          const contract = zilswap.getContract(addr);
          uploadStates[addr] = uploadState = yield call([contract, contract.getSubState], "merkle_roots");
        }
        const merkleRoots = uploadState?.merkle_roots ?? {};
        distributions.push({
          info,
          readyToClaim: typeof merkleRoots[info.epoch_number] === "string",
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

export default function* rewardsSaga() {
  logger("init rewards saga");
  yield take(BlockchainActionTypes.INITIALIZED) // wait for first init
  yield fork(queryDistributors);
  yield fork(queryDistribution);
  yield fork(queryPotentialRewards);
}
