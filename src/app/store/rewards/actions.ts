import { SimpleMap } from "app/utils";
import { EpochInfo } from "core/utilities";
import { PoolZWAPReward } from "./types";

export const RewardsActionTypes = {
  UPDATE_EPOCH_INFO: "UPDATE_EPOCH_INFO",
  UPDATE_ZWAP_REWARDS: "UPDATE_ZWAP_REWARDS",
};

export function updateEpochInfo(info: EpochInfo) {
  return {
    type: RewardsActionTypes.UPDATE_EPOCH_INFO,
    info,
  }
};

export function updateZwapRewards(rewards: SimpleMap<PoolZWAPReward>) {
  return {
    type: RewardsActionTypes.UPDATE_ZWAP_REWARDS,
    rewards,
  }
};
