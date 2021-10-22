import { call, fork, put, select, take, takeLatest } from "redux-saga/effects";
import { SimpleMap } from "tradehub-api-js/build/main/lib/tradehub/utils";
import { ArkClient, logger } from "core/utilities";
import { actions } from "app/store";
import { SortBy } from "app/store/marketplace/actions";
import { getBlockchain, getMarketplace, getWallet } from "../selectors";

function* loadNftList() {
  try {
    logger("load nft list", "start");
    yield put(actions.Layout.addBackgroundLoading("reloadNftList", "RELOAD_NFT_LIST"));
    const { network } = getBlockchain(yield select());
    const { filter } = getMarketplace(yield select());
    const { wallet } = getWallet(yield select());
    const collectionAddress = filter.collectionAddress;
    logger("load nft list", "filter", filter);


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

    switch (filter.sortBy) {
      case SortBy.PriceDescending: {
        query.sortBy = 'price'
        query.sortDir = 'desc'
        break
      }
      case SortBy.PriceAscending: {
        query.sortBy = 'price'
        query.sortDir = 'asc'
        break
      }
      case SortBy.MostRecent: {
        query.sortBy = 'listedAt'
        query.sortDir = 'desc'
        break
      }
      case SortBy.MostLoved: {
        query.sortBy = 'favouriteCount'
        query.sortDir = 'desc'
        break
      }
    }

    if (wallet) {
      query.viewer = wallet.addressInfo.byte20.toLowerCase()
    }

    if (filter.saleType.fixed_price) query.type = 'buyNow'

    if (filter.search !== '') query.search = filter.search;

    if (filter.pagination?.limit) query.limit = filter.pagination?.limit;
    if (filter.pagination?.offset) query.offset = filter.pagination?.offset;

    const arkClient = new ArkClient(network); // TODO: refactor client into redux

    if (filter.owner || filter.likedBy) {
      const newQuery: ArkClient.ListTokenParams = query
      if (filter.owner) newQuery.owner = filter.owner;
      if (filter.likedBy) newQuery.likedBy = filter.likedBy;

      const tokenResult = (yield call(arkClient.listTokens, newQuery)) as unknown as any;

      logger("load nft list", "result", tokenResult);
      yield put(actions.MarketPlace.updateTokens(tokenResult.result));
    } else {
      if (!collectionAddress) return;
      if (wallet) {
        query.viewer = wallet.addressInfo.byte20.toLowerCase()
      }
      const tokenResult = (yield call(arkClient.searchCollection, collectionAddress, query)) as unknown as any;

      logger("load nft search", "result", tokenResult);
      yield put(actions.MarketPlace.updateTokens(tokenResult.result));
    }

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
    actions.Wallet.WalletActionTypes.WALLET_UPDATE,
  ], loadNftList);
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
  yield fork(watchLoadNftList);
}
