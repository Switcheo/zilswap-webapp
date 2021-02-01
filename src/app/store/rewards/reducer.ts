import { SimpleMap } from "app/utils";
import BigNumber from "bignumber.js";
import { EpochInfo, logger, ZWAPPoolWeights } from "core/utilities";
import moment from "moment";
import { RewardsActionTypes } from "./actions";
import { GlobalClaimHistory, PoolZWAPReward, RewardsState, ZAPRewardDist } from "./types";


const initial_state: RewardsState = {
  epochInfo: null,
  rewardByPools: {},
  rewardDistributions: [],
  potentialPoolRewards: {},
  globalClaimHistory: {},
  poolWeights: {},
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
    default:
      return state;
  };
}

export default reducer;
