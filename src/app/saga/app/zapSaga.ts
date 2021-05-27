import { actions } from "app/store";
import { BlockchainActionTypes } from "app/store/blockchain/actions";
import { RewardsActionTypes } from "app/store/rewards/actions";
import { GlobalClaimHistory, WalletState, ZAPRewardDist } from "app/store/types";
import { WalletActionTypes } from "app/store/wallet/actions";
import { SimpleMap } from "app/utils";
import { PollIntervals } from "app/utils/constants";
import { logger, ZAPStats, ZWAPDistribution, ZWAPPoolWeights, ZWAPPotentialRewards } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";
import { ZWAPRewards } from "core/zwap";
import { call, delay, fork, put, race, select, take } from "redux-saga/effects";
import { getWallet, getBlockchain } from "../selectors";

function* queryEpochInfo() {
  logger("query epoch info");
  while (true) {
    const { network } = getBlockchain(yield select());;

    try {
      const info = yield ZAPStats.getEpochInfo({ network });

      yield put(actions.Rewards.updateEpochInfo(info));
    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      const invalidated = yield race({
        minutePoll: delay(PollIntervals.EpochInfo),
        walletUpdated: take(WalletActionTypes.WALLET_UPDATE),
      });

      logger("epoch info invalidated", invalidated);
    }
  }
}

function* queryPoolWeights() {
  logger("query pool weights");
  while (true) {
    const { network } = getBlockchain(yield select());;

    try {
      const poolWeights: ZWAPPoolWeights = yield ZAPStats.getPoolWeights({ network });

      yield put(actions.Rewards.updatePoolWeights(poolWeights));
    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      const invalidated = yield race({
        pollDelay: delay(PollIntervals.PoolWeights),
        networkUpdate: take(BlockchainActionTypes.SET_NETWORK),
      });

      logger("pool weights invalidated", invalidated);
    }
  }
}

function* queryDistribution() {
  logger("query distributions");
  while (true) {
    try {
      const zilswap = ZilswapConnector.getSDK();

      const zwapDistContract = yield getDistributorContract(zilswap);

      const uploadState = yield call([zwapDistContract, zwapDistContract.getSubState], "merkle_roots");
      const merkleRoots = (uploadState?.merkle_roots ?? {}) as SimpleMap<string>;

      const { network } = getBlockchain(yield select());;
      const walletState = getWallet(yield select());

      if (!walletState.wallet) {
        yield put(actions.Rewards.updateDistributions([]));
        continue;
      }

      const distributions: ZWAPDistribution[] = yield ZAPStats.getZWAPDistributions({
        address: walletState.wallet.addressInfo.bech32,
        network,
      });

      const rewardDistributions = distributions.map((info: ZWAPDistribution): ZAPRewardDist => ({
        info,
        readyToClaim: typeof merkleRoots[info.epoch_number] === "string",
      }));

      yield put(actions.Rewards.updateDistributions(rewardDistributions));
    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      const invalidated = yield race({
        networkUpdate: take(BlockchainActionTypes.SET_NETWORK),
        epochUpdated: take(RewardsActionTypes.UPDATE_EPOCH_INFO),
        walletUpdated: take(WalletActionTypes.WALLET_UPDATE),
      });

      logger("epoch info invalidated", invalidated);
    }
  }
}

function* queryClaimHistory() {
  logger("query claim history");
  while (true) {
    try {
      const zilswap = ZilswapConnector.getSDK();

      const zwapDistContract = yield getDistributorContract(zilswap);

      const claimedState = yield call([zwapDistContract, zwapDistContract.getSubState], "claimed_leafs");
      const globalClaimHistory = (claimedState?.claimed_leafs ?? {}) as GlobalClaimHistory;

      yield put(actions.Rewards.updateClaimHistory(globalClaimHistory));
    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      const invalidated = yield race({
        minutePoll: delay(PollIntervals.ZWAPClaimHistory),
        epochUpdated: take(RewardsActionTypes.UPDATE_EPOCH_INFO),
      });

      logger("claim history invalidated", invalidated);
    }
  }
}

function* queryPotentialRewards() {
  logger("query potential rewards");
  while (true) {
    try {
      const { network } = getBlockchain(yield select());;
      const walletState: WalletState = getWallet(yield select());

      if (!walletState.wallet) {
        yield put(actions.Rewards.updatePotentialRewards({}));
        continue;
      }

      const rewardsByPool: ZWAPPotentialRewards = yield ZAPStats.getPotentialRewards({
        address: walletState.wallet.addressInfo.bech32,
        network,
      });

      yield put(actions.Rewards.updatePotentialRewards(rewardsByPool));
    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      const invalidated = yield race({
        epochUpdated: take(RewardsActionTypes.UPDATE_EPOCH_INFO),
        walletUpdated: take(WalletActionTypes.WALLET_UPDATE),
      });

      logger("epoch info invalidated", invalidated);
    }
  }
}

export default function* zapSaga() {
  logger("init zap saga");
  yield take(BlockchainActionTypes.INITIALIZED) // wait for first init
  yield fork(queryEpochInfo);
  yield fork(queryPoolWeights);
  yield fork(queryDistribution);
  yield fork(queryClaimHistory);
  yield fork(queryPotentialRewards);
}

function* getDistributorContract(zilswap: any) {
  const { network } = getBlockchain(yield select());
  const zwapDistContractAddress = ZWAPRewards.DIST_CONTRACT[network];
  return (zilswap.walletProvider || zilswap.zilliqa).contracts.at(zwapDistContractAddress);
}
