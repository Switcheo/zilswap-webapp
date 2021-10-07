import { actions } from "app/store";
import { fork, take, call, put, select } from "redux-saga/effects";
import { logger, ArkClient } from "core/utilities";
import store from "app/store";
import { getWallet } from "../selectors";

function* initialize() {
  try {
    yield put(actions.Layout.addBackgroundLoading("initMarketplace", "INIT_MARKETPLACE"));
    const { wallet } = getWallet(yield select());
    if (!wallet) throw new Error("invalid wallet");
    const authResult = (yield call(ArkClient.arkLogin, wallet)) as unknown as any;
    yield put(actions.MarketPlace.updateAccessToken(authResult.result))
  } catch (error) {
    console.error("initialize failed, Error:")
    console.error(error)
    setTimeout(() => {
      store.dispatch(actions.MarketPlace.initialize());
    }, 10000)
  } finally {
    yield put(actions.Layout.removeBackgroundLoading("INIT_MARKETPLACE"));
    yield put(actions.MarketPlace.loadProfile());
  }
}


function* loadProfile() {
  try {
    yield put(actions.Layout.addBackgroundLoading("loadProfile", "LOAD_PROFILE"));
    const { wallet } = getWallet(yield select());
    if (!wallet) throw new Error("invalid wallet");
    // const userProfile = (yield call(getProfile, wallet.addressInfo.byte20)) as unknown as any;

  } catch (error) {
    console.error("loading profile failed, Error:")
    console.error(error)
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

function* watchInitialize() {
  while (true) {
    yield take(actions.MarketPlace.MarketPlaceActionTypes.INITIALIZE);
    yield call(initialize);
  }
}


export default function* marketPlaceSaga() {
  logger("init marketplace saga");
  yield fork(watchInitialize);
  yield fork(watchProfileLoad);
}
