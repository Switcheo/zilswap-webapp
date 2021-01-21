import { actions } from "app/store";
import { RootState } from "app/store/types";
import { STATS_REFRESH_RATE } from "app/utils/constants";
import { logger, ZAPStats } from "core/utilities";
import moment from "moment";
import { delay, put, select } from "redux-saga/effects";

export default function* statsSaga() {
  logger("init stats saga");

  while (true) {
    logger("run stats saga");
    const network = yield select((state: RootState) => state.layout.network);

    try {
      const volumeDay = yield ZAPStats.getSwapVolume({
        network,
        from: moment().add(-1, "d").unix(),
      });

      yield put(actions.Stats.setSwapVolumes(volumeDay));
    } catch (error) {
      console.error(error);
    } finally {
      yield delay(STATS_REFRESH_RATE);
    }
  }
}
