import { actions } from "app/store";
import { RewardsActionTypes } from "app/store/rewards/actions";
import { TokenActionTypes } from "app/store/token/actions";
import { PoolZWAPReward, RootState, TokenInfo, ZAPEpochInfo } from "app/store/types";
import { SimpleMap } from "app/utils";
import { BIG_ZERO } from "app/utils/constants";
import BigNumber from "bignumber.js";
import { logger, ZWAPPoolWeights } from "core/utilities";
import { put, race, select, take } from "redux-saga/effects";

export default function* poolsSaga() {
  logger("init pools saga");

  while (true) {
    logger("run pools saga");
    try {
      const tokens = (yield select((state: RootState) => state.token.tokens)) as unknown as SimpleMap<TokenInfo>;
      const epochInfo = (yield select((state: RootState) => state.rewards.epochInfo)) as unknown as ZAPEpochInfo | null;
      const poolWeights = (yield select((state: RootState) => state.rewards.poolWeights)) as unknown as ZWAPPoolWeights;

      const poolZwapRewards: SimpleMap<PoolZWAPReward> = {};

      const totalPoolWeight = BigNumber.sum(...Object.values(poolWeights));

      // info loaded && not past rewards emission phase
      if (!!epochInfo && epochInfo.current < epochInfo.maxEpoch) {
        for (const tokenAddress in tokens) {
          const weight = poolWeights[tokenAddress] ?? BIG_ZERO;

          const rewardShare = weight.div(totalPoolWeight);
          const rewardsPerEpoch = new BigNumber(epochInfo.raw.tokens_per_epoch);
          const weeklyReward = rewardsPerEpoch.times(rewardShare).decimalPlaces(5);

          poolZwapRewards[tokenAddress] = { weight: weight.toNumber(), rewardShare, weeklyReward };
        }
      }

      yield put(actions.Rewards.updateZwapRewards(poolZwapRewards));
    } catch (error) {
      console.error(error)
    } finally {
      yield race({
        update_tokens: take(TokenActionTypes.TOKEN_UPDATE),
        update_epoch_info: take(RewardsActionTypes.UPDATE_EPOCH_INFO),
        update_pool_weights: take(RewardsActionTypes.UPDATE_POOL_WEIGHTS),
      });
    }
  }
}
