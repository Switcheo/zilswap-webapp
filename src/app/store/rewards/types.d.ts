import BigNumber from "bignumber.js";
import { EpochInfo, SwapVolume } from "core/utilities";
import moment, { Moment } from "moment";
import { Network } from "zilswap-sdk/lib/constants";

export interface PoolSwapVolume extends SwapVolume {
  totalZilVolume: BigNumber;
  totalTokenVolume: BigNumber;
}

export interface ZAPEpochInfo {
  current: number;
  epochStart: Moment;
  nextEpoch: Moment;
  maxEpoch: number;
  raw: EpochInfo;
};

export interface RewardsState {
  epochInfo: ZAPEpochInfo | null;
};
