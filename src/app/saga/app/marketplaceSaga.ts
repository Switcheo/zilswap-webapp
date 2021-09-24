import { actions } from "app/store";
import { fork, take, call, put } from "redux-saga/effects";
import { logger } from "core/utilities";
import store from "app/store";

function* loadProfile() {
  try {
    yield put(actions.Layout.addBackgroundLoading("loadProfile", "LOAD_PROFILE"));
    // Load profile info with ark API
  } catch (error) {
    console.error("loading profile failed, Error:")
    console.error(error)
    setTimeout(() => {
      store.dispatch(actions.MarketPlace.loadProfile());
    }, 10000)
  } finally {
    yield put(actions.Layout.removeBackgroundLoading("LOAD_PROFILE"));
  }
}

function* watchProfileLoad() {
  while (true) {
    yield take(actions.MarketPlace.MarketPlaceActionTypes.LOAD_PROFILE);
    yield call(loadProfile);
  }
}


export default function* marketPlaceSaga() {
  logger("init marketplace saga");
  yield fork(watchProfileLoad);
}