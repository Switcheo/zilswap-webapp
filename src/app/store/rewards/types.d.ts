import BigNumber from "bignumber.js";
import { EpochInfo, SwapVolume, ZWAPDistribution, ZWAPPoolWeights, ZWAPPotentialRewards } from "core/utilities";
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

  weightedLiquidity: BigNumber;
};

export interface ZAPEpochInfo {
  current: number;
  epochStart: Moment;
  nextEpoch: Moment;
  maxEpoch: number;
  raw: EpochInfo;
};

export interface ZAPRewardDist {
  info: ZWAPDistribution;
  claimed: boolean;
  readyToClaim: boolean;
  claimTx?: any;
}


export interface EpochClaimHistory {
  [leaf: string]: any; // claim content doesnt hold relevant information
}
export interface GlobalClaimHistory {
  [epoch: number]: EpochClaimHistory;
}

export interface RewardsState {
  epochInfo: ZAPEpochInfo | null;
  rewardByPools: SimpleMap<PoolZWAPReward>;
  rewardDistributions: ZAPRewardDist[];
  potentialPoolRewards: ZWAPPotentialRewards;
  globalClaimHistory: GlobalClaimHistory;
  poolWeights: ZWAPPoolWeights;
};
