import { actions } from "app/store";
import { RewardsActionTypes } from "app/store/rewards/actions";
import { PoolZWAPReward, RootState, TokenInfo, ZAPEpochInfo } from "app/store/types";
import { SimpleMap } from "app/utils";
import { BIG_ZERO } from "app/utils/constants";
import { bnOrZero } from "app/utils/strings/strings";
import BigNumber from "bignumber.js";
import { logger, PoolLiquidity, ZAPStats, ZWAPPoolWeights } from "core/utilities";
import { put, race, select, take } from "redux-saga/effects";

export default function* poolsSaga() {
  logger("init pools saga");

  while (true) {
    logger("run pools saga");
    try {
      const network = yield select((state: RootState) => state.layout.network);
      const epochInfo = (yield select((state: RootState) => state.rewards.epochInfo)) as unknown as ZAPEpochInfo | null;
      if (!epochInfo) continue;

      const until = epochInfo.raw.next_epoch_start;
      const from = until - epochInfo.raw.epoch_period;
      const poolsWeightedLiquidity = (yield ZAPStats.getWeightedLiquidity({ network, from, until })) as unknown as PoolLiquidity[];
      const weightedLiquidityMap = poolsWeightedLiquidity.reduce((accum, item) => {
        accum[item.pool] = item;
        return accum;
      }, {} as SimpleMap<PoolLiquidity>);

      const tokens = (yield select((state: RootState) => state.token.tokens)) as unknown as SimpleMap<TokenInfo>;
      const poolWeights = (yield select((state: RootState) => state.rewards.poolWeights)) as unknown as ZWAPPoolWeights;

      const poolZwapRewards: SimpleMap<PoolZWAPReward> = {};

      const totalPoolWeight = BigNumber.sum(...Object.values(poolWeights));

      // info loaded && not past rewards emission phase
      if (epochInfo.current < epochInfo.maxEpoch) {
        for (const tokenAddress in tokens) {
          const weight = poolWeights[tokenAddress] ?? BIG_ZERO;

          const rewardShare = weight.div(totalPoolWeight);
          const rewardsPerEpoch = new BigNumber(epochInfo.raw.tokens_per_epoch).times(0.85);
          const weeklyReward = rewardsPerEpoch.times(rewardShare).decimalPlaces(5);

          const weightedLiquidity = bnOrZero(weightedLiquidityMap[tokenAddress]?.amount);

          poolZwapRewards[tokenAddress] = {
            weight: weight.toNumber(),
            rewardShare,
            weeklyReward,
            weightedLiquidity,
          };
        }
      }

      yield put(actions.Rewards.updateZwapRewards(poolZwapRewards));
    } catch (error) {
      console.error(error)
    } finally {
      yield race({
        update_epoch_info: take(RewardsActionTypes.UPDATE_EPOCH_INFO),
        update_pool_weights: take(RewardsActionTypes.UPDATE_POOL_WEIGHTS),
      });
    }
  }
}
