import { SwapVolume } from "core/utilities";
import { PoolLiquidityMap } from "./types";

export const StatsActionTypes = {
  SET_SWAP_VOLUMES: "SET_SWAP_VOLUMES",
  SET_LIQUIDITY_CHANGE_24H: "SET_LIQUIDITY_CHANGE_24H",
};

export function setSwapVolumes(volumes: SwapVolume[]) {
  return {
    type: StatsActionTypes.SET_SWAP_VOLUMES,
    volumes,
  }
};

export function setLiquidityChange24h(liquidityChange24h: PoolLiquidityMap) {
  return {
    type: StatsActionTypes.SET_LIQUIDITY_CHANGE_24H,
    liquidityChange24h,
  }
};
