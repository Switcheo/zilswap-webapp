import { SimpleMap } from "app/utils";
import {
  DistributionWithStatus, DistributorWithTimings,
  PoolRewards, PotentialRewards
} from "./types";

export const RewardsActionTypes = {
  UPDATE_DISTRIBUTORS: "UPDATE_DISTRIBUTORS",
  UPDATE_DISTRIBUTIONS: "UPDATE_DISTRIBUTIONS",
  UPDATE_POOL_REWARDS: "UPDATE_POOL_REWARDS",
  UPDATE_POTENTIAL_REWARDS: "UPDATE_POTENTIAL_REWARDS",
  ADD_CLAIMED_DISTRIBUTIONS: "ADD_CLAIMED_DISTRIBUTIONS",
  APPEND_DISTRIBUTIONS: "APPEND_DISTRIBUTIONS",
  UPDATE_USER_BEAR_COUNT: "UPDATE_USER_BEAR_COUNT",
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

export function appendDistributions(distributions: DistributionWithStatus[]) {
  return {
    type: RewardsActionTypes.APPEND_DISTRIBUTIONS,
    distributions,
  }
};

export function updateUserBear(bearCount: number) {
  return {
    type: RewardsActionTypes.UPDATE_USER_BEAR_COUNT,
    bearCount,
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
