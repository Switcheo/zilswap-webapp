import { BigNumber } from 'bignumber.js'
import { call, delay, fork, put, race, select, take } from "redux-saga/effects";
import { toBech32Address } from "@zilliqa-js/zilliqa";
import { actions } from "app/store";
import { BlockchainActionTypes } from "app/store/blockchain/actions";
import { RewardsActionTypes } from "app/store/rewards/actions";
import { WalletState, DistributorWithTimings, DistributionWithStatus, PoolReward } from "app/store/types";
import { WalletActionTypes } from "app/store/wallet/actions";
import { SimpleMap } from "app/utils";
import { PollIntervals } from "app/utils/constants";
import { logger, ZAPStats, Distribution, Distributor, PotentialRewards } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";
import { getWallet, getTokens, getBlockchain } from "../selectors";

function* queryDistributors() {
  while (true) {
    logger("zap saga", "query distributors");
    const { network } = getBlockchain(yield select());;
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

      const { network } = getBlockchain(yield select());;
      const walletState = getWallet(yield select());

      if (!walletState.wallet) {
        yield put(actions.Rewards.updateDistributions([]));
        continue;
      }

      const d: ReadonlyArray<Distribution> = yield ZAPStats.getClaimableDistributions({
        address: walletState.wallet.addressInfo.bech32,
        network,
      });

      const distributions: DistributionWithStatus[] = d.map((info: Distribution): DistributionWithStatus => {
        const zilswap = ZilswapConnector.getSDK();
        const contract = zilswap.getContract(info.distributor_address);

        const uploadState: any = call([contract, contract.getSubState], "merkle_roots");
        const merkleRoots = (uploadState?.merkle_roots ?? {}) as SimpleMap<string>;

        return {
          info,
          readyToClaim: typeof merkleRoots[info.epoch_number] === "string",
        }
      })

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
      const { network } = getBlockchain(yield select());;
      const walletState: WalletState = getWallet(yield select());

      if (!walletState.wallet) {
        yield put(actions.Rewards.updatePotentialRewards({}));
        continue;
      }

      const rewardsByPool: PotentialRewards = yield ZAPStats.getPotentialRewards({
        address: walletState.wallet.addressInfo.bech32,
        network,
      });

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

export default function* zapSaga() {
  logger("init zap saga");
  yield take(BlockchainActionTypes.INITIALIZED) // wait for first init
  yield fork(queryDistributors);
  yield fork(queryDistribution);
  yield fork(queryPotentialRewards);
}