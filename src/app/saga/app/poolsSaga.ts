import { actions } from "app/store";
import { RewardsActionTypes } from "app/store/rewards/actions";
import { TokenActionTypes } from "app/store/token/actions";
import { PoolZWAPReward, RootState, TokenInfo, ZAPEpochInfo } from "app/store/types";
import { SimpleMap } from "app/utils";
import { POOL_WEIGHTS, TOTAL_POOL_WEIGHTS, ZWAP_REWARDS_PER_EPOCH } from "app/utils/constants";
import BigNumber from "bignumber.js";
import { logger } from "core/utilities";
import { put, race, select, take } from "redux-saga/effects";

export default function* poolsSaga() {
  logger("init pools saga");

  while (true) {
    logger("run pools saga");
    try {
      const tokens = (yield select((state: RootState) => state.token.tokens)) as unknown as SimpleMap<TokenInfo>;
      const epochInfo = (yield select((state: RootState) => state.rewards.epochInfo)) as unknown as ZAPEpochInfo | null;

      const poolZwapRewards: SimpleMap<PoolZWAPReward> = {};

      // info loaded && not past rewards emission phase
      if (!!epochInfo && epochInfo.current < epochInfo.maxEpoch) {
        for (const tokenAddress in tokens) {
          const weight = POOL_WEIGHTS[tokenAddress] ?? 0;

          const rewardShare = new BigNumber(weight).div(TOTAL_POOL_WEIGHTS);
          const weeklyReward = ZWAP_REWARDS_PER_EPOCH.times(rewardShare).decimalPlaces(5);

          poolZwapRewards[tokenAddress] = { weight, rewardShare, weeklyReward };
        }
      }

      yield put(actions.Rewards.updateZwapRewards(poolZwapRewards));
    } catch (error) {
      console.error(error)
    } finally {
      yield race({
        update_tokens: take(TokenActionTypes.TOKEN_UPDATE),
        update_epoch_info: take(RewardsActionTypes.UPDATE_EPOCH_INFO),
      });
    }
  }
}
