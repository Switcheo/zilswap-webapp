import BigNumber from "bignumber.js";
import { SwapVolume } from "core/utilities";
import moment from "moment";
import { Network } from "zilswap-sdk/lib/constants";

export interface PoolSwapVolume extends SwapVolume {
  totalZilVolume: BigNumber;
  totalTokenVolume: BigNumber;
}

export interface PoolSwapVolumeMap {
  [pool: string]: PoolSwapVolume;
};

export interface StatsState {
  dailySwapVolumes: PoolSwapVolumeMap;
};
