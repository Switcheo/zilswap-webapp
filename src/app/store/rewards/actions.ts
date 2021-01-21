import { EpochInfo } from "core/utilities";

export const ActionTypes = {
  UPDATE_EPOCH_INFO: "UPDATE_EPOCH_INFO",
};

export function updateEpochInfo(info: EpochInfo) {
  return {
    type: ActionTypes.UPDATE_EPOCH_INFO,
    info,
  }
};
