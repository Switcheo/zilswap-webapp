import { SimpleMap } from "app/utils";
import { RewardsActionTypes } from "./actions";
import { DistributionWithStatus, DistributorWithTimings, PoolRewards, PotentialRewards, RewardsState } from "./types";

const initial_state: RewardsState = {
  distributors: [],
  distributions: [],
  rewardsByPool: {},
  potentialRewardsByPool: {},
  claimedDistributions: [],
  bearCount: 0
};

const reducer = (state: RewardsState = initial_state, action: any): RewardsState => {
  switch (action.type) {
    case RewardsActionTypes.UPDATE_DISTRIBUTORS: {
      const distributors = action.distributors as ReadonlyArray<DistributorWithTimings>;
      return {
        ...state,
        distributors
      };
    }
    case RewardsActionTypes.UPDATE_DISTRIBUTIONS: {
      const distributions = action.distributions as ReadonlyArray<DistributionWithStatus>;
      return {
        ...state,
        distributions,
      };
    }
    case RewardsActionTypes.APPEND_DISTRIBUTIONS: {
      const distributions = action.distributions as ReadonlyArray<DistributionWithStatus>;
      return {
        ...state,
        distributions: [...state.distributions, ...distributions],
      };
    }
    case RewardsActionTypes.ADD_CLAIMED_DISTRIBUTIONS: {
      const ids = action.distributionIds as string[];
      return {
        ...state,
        claimedDistributions: [
          ...state.claimedDistributions,
          ...ids,
        ],
      };
    }
    case RewardsActionTypes.UPDATE_POOL_REWARDS:
      const rewardsByPool = action.rewards as SimpleMap<PoolRewards>;
      return {
        ...state,
        rewardsByPool,
      };
    case RewardsActionTypes.UPDATE_POTENTIAL_REWARDS:
      const potentialRewardsByPool = action.potentialRewards as PotentialRewards;
      return {
        ...state,
        potentialRewardsByPool,
      };
    case RewardsActionTypes.UPDATE_USER_BEAR_COUNT:
      return {
        ...state,
        bearCount: action.bearCount
      }
    default:
      return state;
  };
}

export default reducer;
