import { SimpleMap } from "app/utils";
import BigNumber from "bignumber.js";
import { SwapVolume } from "core/utilities";

export interface PoolSwapVolume extends SwapVolume {
  totalZilVolume: BigNumber;
  totalTokenVolume: BigNumber;
}

export interface PoolSwapVolumeMap extends SimpleMap<PoolSwapVolume> {};
export interface PoolLiquidityMap extends SimpleMap<BigNumber> {};

export interface StatsState {
  dailySwapVolumes: PoolSwapVolumeMap;
  liquidityChange24h: PoolLiquidityMap;
};
