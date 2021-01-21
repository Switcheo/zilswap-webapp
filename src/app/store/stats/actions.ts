import { SwapVolume } from "core/utilities";

export const ActionTypes = {
  SET_SWAP_VOLUMES: "SET_SWAP_VOLUMES",
};

export function setSwapVolumes(volumes: SwapVolume[]) {
  return {
    type: ActionTypes.SET_SWAP_VOLUMES,
    volumes,
  }
};
