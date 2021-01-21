import { SwapVolume } from "core/utilities";
import { ActionTypes } from "./actions";
import { PoolSwapVolumeMap, StatsState } from "./types";


const initial_state: StatsState = {
  dailySwapVolumes: {},
};

const reducer = (state: StatsState = initial_state, actions: any) => {
  switch (actions.type) {
    case ActionTypes.SET_SWAP_VOLUMES:
      const dailySwapVolumes = actions.volumes.reduce((accum: PoolSwapVolumeMap, volume: SwapVolume) => {
        accum[volume.pool] = {
          ...volume,
          totalZilVolume: volume.in_zil_amount.plus(volume.out_zil_amount),
          totalTokenVolume: volume.in_token_amount.plus(volume.out_token_amount),
        };
        return accum;
      }, {} as PoolSwapVolumeMap);
      return {
        ...state,
        dailySwapVolumes,
      };
    default:
      return state;
  };
}

export default reducer;
