import store, { actions } from "app/store";
import { ArkClient, logger } from "core/utilities";
import { call, fork, put, select, take, takeLatest } from "redux-saga/effects";
import { SimpleMap } from "tradehub-api-js/build/main/lib/tradehub/utils";
import { getBlockchain, getMarketplace, getWallet } from "../selectors";

function* initialize() {
  try {
    // yield put(actions.Layout.addBackgroundLoading("initMarketplace", "INIT_MARKETPLACE"));
    // const { wallet } = getWallet(yield select());
    // const { network } = getBlockchain(yield select());
    // if (!wallet) throw new Error("invalid wallet");
    throw new Error("too many login requests");
    // const hostname = window.location.hostname;
    // const arkClient = new ArkClient(network); // TODO: refactor client into redux
    // const authResult = (yield call(arkClient.arkLogin, wallet, hostname)) as unknown as any;
    // yield put(actions.MarketPlace.updateAccessToken(authResult.result))
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

function* loadNftList() {
  try {
    logger("load nft list", "start");
    yield put(actions.Layout.addBackgroundLoading("reloadNftList", "RELOAD_NFT_LIST"));
    const { network } = getBlockchain(yield select());
    const { filter } = getMarketplace(yield select());
    const collectionAddress = filter.collectionAddress;
    logger("load nft list", "filter", filter);

    if (!collectionAddress) return;

    const traits = {
      include: {} as SimpleMap<string[]>,
    };
    for (const { trait, values } of Object.values(filter.traits)) {
      let shouldIgnoreTrait = true;
      let selectedValues = [];
      for (const valueOption of Object.values(values)) {
        if (!valueOption.selected)
          shouldIgnoreTrait = false;
        else
          selectedValues.push(valueOption.value);
      }

      if (!shouldIgnoreTrait)
        traits.include[trait] = selectedValues;
    }

    const query: ArkClient.SearchCollectionParams = {
      q: JSON.stringify({ traits }),
    };

    const arkClient = new ArkClient(network); // TODO: refactor client into redux
    const tokenResult = (yield call(arkClient.searchCollection, collectionAddress, query)) as unknown as any;

    logger("load nft list", "result", tokenResult);
    yield put(actions.MarketPlace.updateTokens(tokenResult.result));

  } catch (error) {
    console.error("loading profile failed, Error:")
    console.error(error)
  } finally {
    yield put(actions.Layout.removeBackgroundLoading("RELOAD_NFT_LIST"));
  }
}

function* loadProfile() {
  try {
    yield put(actions.Layout.addBackgroundLoading("loadProfile", "LOAD_PROFILE"));
    const { wallet } = getWallet(yield select());
    const { network } = getBlockchain(yield select());

    const arkClient = new ArkClient(network);
    if (!wallet) throw new Error("invalid wallet");
    const { result: { model } } = (yield call(arkClient.getProfile, wallet.addressInfo.byte20)) as unknown as any;
    yield put(actions.MarketPlace.updateProfile(model));

  } catch (error) {
    console.error("loading profile failed, Error:")
    console.error(error)
  } finally {
    yield put(actions.Layout.removeBackgroundLoading("LOAD_PROFILE"));
  }
}

function* watchLoadNftList() {
  yield takeLatest([
    actions.MarketPlace.MarketPlaceActionTypes.RELOAD_TOKEN_LIST,
    actions.MarketPlace.MarketPlaceActionTypes.UPDATE_FILTER,
  ], loadNftList);
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
  yield fork(watchLoadNftList);
}
