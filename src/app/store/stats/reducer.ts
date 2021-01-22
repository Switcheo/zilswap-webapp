import { SwapVolume } from "core/utilities";
import { StatsActionTypes } from "./actions";
import { PoolLiquidityMap, PoolSwapVolumeMap, StatsState } from "./types";


const initial_state: StatsState = {
  dailySwapVolumes: {},
  liquidityChange24h: {},
};

const reducer = (state: StatsState = initial_state, actions: any) => {
  switch (actions.type) {
    case StatsActionTypes.SET_SWAP_VOLUMES:
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
    case StatsActionTypes.SET_LIQUIDITY_CHANGE_24H:
      const liquidityChange24h = actions.liquidityChange24h as PoolLiquidityMap;
      return {
        ...state,
        liquidityChange24h,
      };
    default:
      return state;
  };
}

export default reducer;
