import { SimpleMap } from "app/utils";
import {
  PoolRewards, PotentialRewards,
  DistributionWithStatus, DistributorWithTimings
} from "./types";

export const RewardsActionTypes = {
  UPDATE_DISTRIBUTORS: "UPDATE_DISTRIBUTORS",
  UPDATE_DISTRIBUTIONS: "UPDATE_DISTRIBUTIONS",
  UPDATE_POOL_REWARDS: "UPDATE_POOL_REWARDS",
  UPDATE_POTENTIAL_REWARDS: "UPDATE_POTENTIAL_REWARDS",
  ADD_CLAIMED_DISTRIBUTIONS: "ADD_CLAIMED_DISTRIBUTIONS",
};

export function updateDistributors(distributors: ReadonlyArray<DistributorWithTimings>) {
  return {
    type: RewardsActionTypes.UPDATE_DISTRIBUTORS,
    distributors,
  }
}

export function updatePoolRewards(rewards: SimpleMap<PoolRewards>) {
  return {
    type: RewardsActionTypes.UPDATE_POOL_REWARDS,
    rewards,
  }
};

export function updateDistributions(distributions: DistributionWithStatus[]) {
  return {
    type: RewardsActionTypes.UPDATE_DISTRIBUTIONS,
    distributions,
  }
};

export function updatePotentialRewards(potentialRewards: PotentialRewards) {
  return {
    type: RewardsActionTypes.UPDATE_POTENTIAL_REWARDS,
    potentialRewards,
  }
};

export function addClaimedDistributions(distributionIds: string[]) {
  return {
    type: RewardsActionTypes.ADD_CLAIMED_DISTRIBUTIONS,
    distributionIds,
  }
};
