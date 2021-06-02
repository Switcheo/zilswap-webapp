import { LocalStoragePackage, SimpleMap } from "app/utils";
import { LocalStorageKeys } from "app/utils/constants";
import BigNumber from "bignumber.js";
import { EpochInfo, logger, ZWAPPoolWeights } from "core/utilities";
import moment from "moment";
import { RewardsActionTypes } from "./actions";
import { GlobalClaimHistory, PendingClaimTx, PendingClaimTxCache, PoolZWAPReward, RewardsState, ZAPRewardDist } from "./types";

const PENDING_CLAIM_TX_STORAGE_VERSION = 1;
type PendingTxPackage = LocalStoragePackage<SimpleMap<PendingClaimTxCache>>;
const loadClaimTxs = (): SimpleMap<PendingClaimTxCache> => {
  const savedData = localStorage.getItem(LocalStorageKeys.PendingClaimedTxs);
  logger("load stored pending claim txs", savedData);

  if (!savedData) return {};

  try {
    const savedPendingTxs = JSON.parse(savedData) as PendingTxPackage;
    if (savedPendingTxs.version !== PENDING_CLAIM_TX_STORAGE_VERSION) return {};

    // hydrate date objects
    for (const address in savedPendingTxs.data) {
      const pendingTxs = savedPendingTxs.data[address];
      for (const hash in pendingTxs) {
        const dispatchedAt = moment(pendingTxs[hash].dispatchedAt);

        // ignore pending txs dispatched > 15 mins ago
        if (dispatchedAt.isBefore(moment().add(15, "minute"))) {
          continue;
        }
        pendingTxs[hash].dispatchedAt = dispatchedAt;
      }
    }

    logger("pending claim txs parse success", savedPendingTxs.data);
    return savedPendingTxs.data;
  } catch (error) {
    return {};
  }
};

const saveClaimTxs = (claimTxs: SimpleMap<PendingClaimTxCache>) => {
  const content: PendingTxPackage = {
    version: PENDING_CLAIM_TX_STORAGE_VERSION,
    data: claimTxs,
  };
  localStorage.setItem(LocalStorageKeys.PendingClaimedTxs, JSON.stringify(content));
};

const initial_state: RewardsState = {
  epochInfo: null,
  rewardByPools: {},
  rewardDistributions: [],
  potentialPoolRewards: {},
  globalClaimHistory: {},
  poolWeights: {},
  claimTxs: loadClaimTxs(),
};

const updateDistributionClaims = (distributions: ZAPRewardDist[], globalClaimHistory: GlobalClaimHistory) => {
  if (!globalClaimHistory || !distributions.length) return;

  for (const distribution of distributions) {
    const epochClaimHistory = globalClaimHistory[distribution.info.epoch_number];
    if (!epochClaimHistory) continue;

    const leafHash = distribution.info.proof[0];
    distribution.claimed = !!epochClaimHistory[`0x${leafHash}`];

    logger("zwap dist claim", distribution.info.epoch_number, distribution.claimed);
  }
};

const reducer = (state: RewardsState = initial_state, actions: any) => {
  switch (actions.type) {
    case RewardsActionTypes.UPDATE_EPOCH_INFO:
      const info = actions.info as EpochInfo;
      return {
        ...state,
        epochInfo: {
          current: info.current_epoch,
          epochStart: moment.unix(info.first_epoch_start),
          nextEpoch: moment.unix(info.next_epoch_start),
          maxEpoch: info.total_epoch,
          raw: info,
        },
      };
    case RewardsActionTypes.UPDATE_ZWAP_REWARDS:
      const rewardByPools = actions.rewards as SimpleMap<PoolZWAPReward>;
      return {
        ...state,
        rewardByPools,
      };
    case RewardsActionTypes.UPDATE_POOL_WEIGHTS:
      const poolWeights = actions.poolWeights as ZWAPPoolWeights;
      return {
        ...state,
        poolWeights,
      };
    case RewardsActionTypes.UPDATE_DISTRIBUTIONS: {
      const rewardDistributions = actions.distributions as ZAPRewardDist[];
      updateDistributionClaims(rewardDistributions, state.globalClaimHistory);
      return {
        ...state,
        rewardDistributions,
      };
    }
    case RewardsActionTypes.UPDATE_CLAIM_HISTORY: {
      const globalClaimHistory = actions.history as GlobalClaimHistory;
      const rewardDistributions = state.rewardDistributions;
      updateDistributionClaims(rewardDistributions, globalClaimHistory);
      return {
        ...state,
        rewardDistributions: [...rewardDistributions],
        globalClaimHistory,
      };
    }
    case RewardsActionTypes.UPDATE_POTENTIAL_REWARDS:
      const potentialPoolRewards = actions.potentialPoolRewards as BigNumber;
      return {
        ...state,
        potentialPoolRewards,
      };
    case RewardsActionTypes.ADD_PENDING_CLAIM_TX:
      const address = actions.bech32Address as string;
      const pendingTx = actions.pendingTx as PendingClaimTx;

      const claimTxs = {
        ...state.claimTxs,
        [address]: {
          ...state.claimTxs[address],
          [pendingTx.txHash]: pendingTx,
        }
      };

      saveClaimTxs(claimTxs);

      return {
        ...state,
        claimTxs,
      };
    case RewardsActionTypes.REMOVE_PENDING_CLAIM_TX:
      const hash = actions.hash as string;

      for (const address in state.claimTxs) {
        if (state.claimTxs[address][hash]) {
          delete state.claimTxs[address][hash];
          // recreate state the refresh ui
          state.claimTxs[address] = {
            ...state.claimTxs[address],
          };
        }
      }
      saveClaimTxs(state.claimTxs);

      return {
        ...state,
        claimTxs: {
          ...state.claimTxs,
        },
      };
    default:
      return state;
  };
}

export default reducer;
