import { actions } from "app/store";
import { LayoutActionTypes } from "app/store/layout/actions";
import { RewardsActionTypes } from "app/store/rewards/actions";
import { GlobalClaimHistory, RootState, WalletState, ZAPRewardDist } from "app/store/types";
import { WalletActionTypes } from "app/store/wallet/actions";
import { PollIntervals } from "app/utils/constants";
import { logger, ZAPStats, ZWAPDistribution, ZWAPPotentialRewards } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";
import { ZWAPRewards } from "core/zwap";
import { call, delay, fork, put, race, select, take } from "redux-saga/effects";
import { Network } from "zilswap-sdk/lib/constants";

function* queryEpochInfo() {
  logger("query epoch info");
  while (true) {
    const network = yield select((state: RootState) => state.layout.network);

    try {
      const info = yield ZAPStats.getEpochInfo({ network });

      yield put(actions.Rewards.updateEpochInfo(info));
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
    const network = yield select((state: RootState) => state.layout.network);

    try {
      const poolWeights = yield ZAPStats.getPoolWeights({ network });

      yield put(actions.Rewards.updatePoolWeights(poolWeights));
    } finally {
      const invalidated = yield race({
        networkUpdate: take(LayoutActionTypes.UPDATE_NETWORK),
        pollDelay: delay(PollIntervals.PoolWeights),
      });

      logger("pool weights invalidated", invalidated);
    }
  }
}

function* queryDistribution() {
  logger("query distributions");
  while (true) {
    try {
      const network = yield select((state: RootState) => state.layout.network);
      const walletState: WalletState = yield select((state: RootState) => state.wallet);

      if (!walletState.wallet) {
        yield put(actions.Rewards.updateDistributions([]));
        continue;
      }

      const distributions = yield ZAPStats.getZWAPDistributions({
        address: walletState.wallet.addressInfo.bech32,
        network,
      });

      const rewardDistributions = distributions.map((info: ZWAPDistribution): ZAPRewardDist => ({
        info,
        claimed: false,
      }));

      yield put(actions.Rewards.updateDistributions(rewardDistributions));
    } finally {
      const invalidated = yield race({
        networkUpdate: take(LayoutActionTypes.UPDATE_NETWORK),
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
      const network: Network = yield select((state: RootState) => state.layout.network);

      // wait until zilswap is initialized
      while (!ZilswapConnector.connectorState?.zilswap) {
        yield new Promise(resolve => setTimeout(resolve, 1000));
      };

      const zilswap: any = ZilswapConnector.connectorState?.zilswap;
      if (!zilswap) continue;

      const zwapDistContractAddress = ZWAPRewards.DIST_CONTRACT[network];
      const zwapDistContract = (zilswap.walletProvider || zilswap.zilliqa).contracts.at(zwapDistContractAddress);

      const claimedState = yield call([zwapDistContract, zwapDistContract.getSubState], "claimed_leafs");
      const globalClaimHistory = (claimedState?.claimed_leafs ?? {}) as GlobalClaimHistory;

      yield put(actions.Rewards.updateClaimHistory(globalClaimHistory));
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
      const network = yield select((state: RootState) => state.layout.network);
      const walletState: WalletState = yield select((state: RootState) => state.wallet);

      if (!walletState.wallet) {
        yield put(actions.Rewards.updateDistributions([]));
        continue;
      }

      const rewardsByPool: ZWAPPotentialRewards = yield ZAPStats.getPotentialRewards({
        address: walletState.wallet.addressInfo.bech32,
        network,
      });

      yield put(actions.Rewards.updatePotentialRewards(rewardsByPool));
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
  yield fork(queryEpochInfo);
  yield fork(queryPoolWeights);
  yield fork(queryDistribution);
  yield fork(queryClaimHistory);
  yield fork(queryPotentialRewards);
  yield fork(queryPotentialRewards);
}
