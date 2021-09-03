import { SimpleMap } from "app/utils";
import {
  PendingClaimTx, PoolRewards, PotentialRewards,
  DistributionWithStatus, DistributorWithTimings
} from "./types";

export const RewardsActionTypes = {
  UPDATE_DISTRIBUTORS: "UPDATE_DISTRIBUTORS",
  UPDATE_DISTRIBUTIONS: "UPDATE_DISTRIBUTIONS",
  UPDATE_POOL_REWARDS: "UPDATE_POOL_REWARDS",
  UPDATE_POTENTIAL_REWARDS: "UPDATE_POTENTIAL_REWARDS",
  ADD_PENDING_CLAIM_TX: "ADD_PENDING_CLAIM_TX",
  REMOVE_PENDING_CLAIM_TX: "REMOVE_PENDING_CLAIM_TX",
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

export function addPendingClaimTx(bech32Address: string, pendingTx: PendingClaimTx) {
  return {
    type: RewardsActionTypes.ADD_PENDING_CLAIM_TX,
    bech32Address,
    pendingTx,
  }
};

export function removePendingClaimTx(hash: string) {
  return {
    type: RewardsActionTypes.REMOVE_PENDING_CLAIM_TX,
    hash,
  }
};
