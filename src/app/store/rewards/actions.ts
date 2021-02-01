import { SimpleMap } from "app/utils";
import { EpochInfo, ZWAPPoolWeights, ZWAPPotentialRewards } from "core/utilities";
import { GlobalClaimHistory, PoolZWAPReward, ZAPRewardDist } from "./types";

export const RewardsActionTypes = {
  UPDATE_EPOCH_INFO: "UPDATE_EPOCH_INFO",
  UPDATE_ZWAP_REWARDS: "UPDATE_ZWAP_REWARDS",
  UPDATE_DISTRIBUTIONS: "UPDATE_DISTRIBUTIONS",
  UPDATE_CLAIM_HISTORY: "UPDATE_CLAIM_HISTORY",
  UPDATE_POTENTIAL_REWARDS: "UPDATE_POTENTIAL_REWARDS",
  UPDATE_POOL_WEIGHTS: "UPDATE_POOL_WEIGHTS",
};

export function updateEpochInfo(info: EpochInfo) {
  return {
    type: RewardsActionTypes.UPDATE_EPOCH_INFO,
    info,
  }
};

export function updatePoolWeights(poolWeights: ZWAPPoolWeights) {
  return {
    type: RewardsActionTypes.UPDATE_POOL_WEIGHTS,
    poolWeights,
  }
};

export function updateZwapRewards(rewards: SimpleMap<PoolZWAPReward>) {
  return {
    type: RewardsActionTypes.UPDATE_ZWAP_REWARDS,
    rewards,
  }
};

export function updateDistributions(distributions: ZAPRewardDist[]) {
  return {
    type: RewardsActionTypes.UPDATE_DISTRIBUTIONS,
    distributions,
  }
};

export function updateClaimHistory(history: GlobalClaimHistory) {
  return {
    type: RewardsActionTypes.UPDATE_CLAIM_HISTORY,
    history,
  }
};

export function updatePotentialRewards(potentialPoolRewards: ZWAPPotentialRewards) {
  return {
    type: RewardsActionTypes.UPDATE_POTENTIAL_REWARDS,
    potentialPoolRewards,
  }
};
