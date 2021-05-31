import { SimpleMap } from "app/utils";
import BigNumber from "bignumber.js";
import { EpochInfo, SwapVolume, ZWAPDistribution, ZWAPPoolWeights, ZWAPPotentialRewards } from "core/utilities";
import { Dayjs } from "dayjs";

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
  epochStart: Dayjs;
  nextEpoch: Dayjs;
  maxEpoch: number;
  raw: EpochInfo;
};

export interface ZAPRewardDist {
  info: ZWAPDistribution;
  readyToClaim: boolean;
  claimed?: boolean;
  claimTx?: any;
}


export interface EpochClaimHistory {
  [leaf: string]: any; // claim content doesnt hold relevant information
}
export interface GlobalClaimHistory {
  [epoch: number]: EpochClaimHistory;
}

export interface PendingClaimTx {
  epoch: number;
  txHash: string;
  dispatchedAt: Dayjs;
}
export interface PendingClaimTxCache {
  [hash: string]: PendingClaimTx;
}

export interface RewardsState {
  epochInfo: ZAPEpochInfo | null;
  rewardByPools: SimpleMap<PoolZWAPReward>;
  rewardDistributions: ZAPRewardDist[];
  potentialPoolRewards: ZWAPPotentialRewards;
  globalClaimHistory: GlobalClaimHistory;
  poolWeights: ZWAPPoolWeights;
  claimTxs: SimpleMap<PendingClaimTxCache>;
};
