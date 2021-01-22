import BigNumber from "bignumber.js";
import { EpochInfo, SwapVolume } from "core/utilities";
import moment, { Moment } from "moment";
import { Network } from "zilswap-sdk/lib/constants";

export interface PoolSwapVolume extends SwapVolume {
  totalZilVolume: BigNumber;
  totalTokenVolume: BigNumber;
}

export type PoolZWAPReward = {
  weeklyReward: BigNumber;
  rewardShare: BigNumber; // pool reward weight ÷ total weight
  weight: number;
};

export interface ZAPEpochInfo {
  current: number;
  epochStart: Moment;
  nextEpoch: Moment;
  maxEpoch: number;
  raw: EpochInfo;
};

export interface RewardsState {
  epochInfo: ZAPEpochInfo | null;
  rewardByPools: SimpleMap<PoolZWAPReward>
};
