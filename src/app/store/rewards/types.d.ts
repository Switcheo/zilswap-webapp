import { SimpleMap } from "app/utils";
import BigNumber from "bignumber.js";
import { Distributor, SwapVolume, Distribution, PotentialRewards } from "core/utilities";
import { Dayjs } from "dayjs";
import { TokenInfo } from "../token/types";

export interface PoolSwapVolume extends SwapVolume {
  totalZilVolume: BigNumber;
  totalTokenVolume: BigNumber;
}

export type PoolReward = {
  distributorName: string;
  rewardToken: TokenInfo;
  currentEpochStart: number;
  currentEpochEnd: number;
  amountPerEpoch: BigNumber;
  weightedLiquidity: BigNumber;
}

export type PoolRewards = ReadonlyArray<PoolReward>;

export interface DistributionWithStatus {
  info: Distribution;
  readyToClaim: boolean;
  claimed?: boolean;
  claimTx?: any;
}

export interface DistributorWithTimings extends Distributor {
  currentEpochStart: number;
  currentEpochEnd: number;
}

export interface PotentialRewards {
  [pool: string]: ReadonlyArray<{
    amount: BigNumber,
    tokenAddress: string
  }>
}

export interface RewardsState {
  distributors: ReadonlyArray<DistributorWithTimings>;
  distributions: ReadonlyArray<DistributionWithStatus>;
  rewardsByPool: SimpleMap<PoolRewards>;
  potentialRewardsByPool: PotentialRewards;
};

// TODO: maybe remove these?
export interface PendingClaimTx {
  txHash: string;
  dispatchedAt: Dayjs;
}

export interface PendingClaimTxCache {
  [hash: string]: PendingClaimTx;
}
