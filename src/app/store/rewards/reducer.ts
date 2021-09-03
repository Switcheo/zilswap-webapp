import { SimpleMap } from "app/utils";
import { PotentialRewards } from "core/utilities";
import { RewardsActionTypes } from "./actions";
import { PoolRewards, RewardsState, DistributionWithStatus, DistributorWithTimings } from "./types";

const initial_state: RewardsState = {
  distributors: [],
  distributions: [],
  rewardsByPool: {},
  potentialRewardsByPool: {},
};

const reducer = (state: RewardsState = initial_state, action: any) => {
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
    default:
      return state;
  };
}

export default reducer;
