import { actions } from "app/store";
import { fork, take, call, put, select } from "redux-saga/effects";
import { logger } from "core/utilities";
import { getWallet } from "../selectors";
import * as  tbmConnector from "core/zilswap/tbm";
import store from "app/store";

// function* loadMarketPlace() {

// }

function* loadProfile() {
  try {
    yield put(actions.Layout.addBackgroundLoading("loadProfile", "LOAD_PROFILE"));
    const { wallet } = getWallet(yield select())
    const tokenIds: string[] = yield tbmConnector.getOwnedToken(wallet);
    logger("update token id", tokenIds);
    yield put(actions.MarketPlace.updateProfile({ ownedNft: tokenIds }));
  } catch (error) {
    console.error("loading profile failed, Error:")
    console.error(error)
    setTimeout(() => {
      store.dispatch(actions.MarketPlace.loadProfile());
    }, 10000)
  }
}

// function* watchMarketPlaceInit() {

// }

function* watchProfileLoad() {
  while (true) {
    yield take(actions.MarketPlace.MarketPlaceActionTypes.LOAD_PROFILE);
    yield call(loadProfile);
  }
}


export default function* marketPlaceSaga() {
  logger("init marketplace saga");
  // yield fork(watchMarketPlaceInit);
  yield fork(watchProfileLoad);
}