import { actions } from "app/store";
import { RootState } from "app/store/types";
import { logger, ZAPStats } from "core/utilities";
import { put, race, select } from "redux-saga/effects";

export default function* zapSaga() {
  logger("init zap saga");
  while (true) {
    logger("run zap saga");
    const network = yield select((state: RootState) => state.layout.network);

    try {
      const info = yield ZAPStats.getEpochInfo({ network });

      yield put(actions.Rewards.updateEpochInfo(info));
    } finally {
      yield race({

      });
    }
  }
}
