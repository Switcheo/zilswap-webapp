import { call, fork, delay, put, select, takeLatest, takeEvery } from "redux-saga/effects";
import { toBech32Address } from "@zilliqa-js/crypto";
import dayjs from "dayjs";
import { ArkClient, ArkExchangeInfo, logger, waitForTx } from "core/utilities";
import { actions } from "app/store";
import { SortBy } from "app/store/marketplace/actions";
import { ArkPendingTx, Nft, PaginatedList, QueryNftResult } from "app/store/types";
import { SimpleMap } from "app/utils";
import { getBlockchain, getMarketplace, getWallet } from "../selectors";

function* loadNftList() {
  try {
    logger("load nft list", "start");
    const { filter } = getMarketplace(yield select());
    if (filter?.infinite) {
      yield put(actions.Layout.addBackgroundLoading("loadTokens", "ARK:LOAD_TOKENS"));
    } else {
      yield put(actions.Layout.addBackgroundLoading("reloadNftList", "ARK:RELOAD_NFT_LIST"));
    }
    const { network } = getBlockchain(yield select());
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
    if (filter.artist) query.artist = filter.artist;

    if (wallet) {
      query.viewer = wallet.addressInfo.byte20.toLowerCase()
    }

    if (filter.saleType.fixed_price) query.type = 'buyNow'

    if (filter.search !== '') query.search = filter.search;

    if (filter.pagination?.limit) query.limit = filter.pagination?.limit;
    if (filter.pagination?.offset) query.offset = filter.pagination?.offset;

    const arkClient = new ArkClient(network); // TODO: refactor client into redux

    if (filter.owner || filter.likedBy) {
      delete query.q;
      const newQuery: ArkClient.ListTokenParams = query;
      if (filter.owner) newQuery.owner = filter.owner;
      if (filter.likedBy) newQuery.likedBy = filter.likedBy;

      const res = (yield call(arkClient.listTokens, newQuery)) as unknown as PaginatedList<Nft>;

      logger("load nft list", "result", res);
      if (filter?.infinite) {
        yield put(actions.MarketPlace.appendTokens(res));
      } else {
        yield put(actions.MarketPlace.updateTokens(res));
      }
    } else {
      if (!collectionAddress) return;
      if (wallet) {
        query.viewer = wallet.addressInfo.byte20.toLowerCase()
      }
      const result = (yield call(arkClient.searchCollection, collectionAddress, query)) as unknown as QueryNftResult;

      logger("load nft search", "result", result);
      if (filter?.infinite) {
        yield put(actions.MarketPlace.appendTokens(result));
      } else {
        yield put(actions.MarketPlace.updateTokens(result));
      }
    }

  } catch (error) {
    console.error("loading profile failed, Error:")
    console.error(error)
  } finally {
    yield put(actions.Layout.removeBackgroundLoading("ARK:LOAD_TOKENS"));
    yield put(actions.Layout.removeBackgroundLoading("ARK:RELOAD_NFT_LIST"));
  }
}

function* loadProfile() {
  try {
    yield put(actions.Layout.addBackgroundLoading("loadProfile", "ARK:LOAD_PROFILE"));
    const { wallet } = getWallet(yield select());
    const { network } = getBlockchain(yield select());
    let { oAuth } = getMarketplace(yield select());

    const arkClient = new ArkClient(network);
    if (!wallet) throw new Error("invalid wallet");
    
    const accessTokenValid = oAuth?.expires_at && dayjs.unix(oAuth.expires_at).isAfter(dayjs().add(30, "second"));
    if (wallet.addressInfo.bech32 !== oAuth?.address || !accessTokenValid)
      oAuth = undefined;

    const { result: { model } } = (yield call(arkClient.getProfile, wallet.addressInfo.byte20.toLowerCase(), oAuth)) as unknown as any;
    yield put(actions.MarketPlace.updateProfile(model));

  } catch (error) {
    console.error("loading profile failed, Error:")
    console.error(error)
  } finally {
    yield put(actions.Layout.removeBackgroundLoading("ARK:LOAD_PROFILE"));
  }
}

function* reloadExchangeInfo() {
  try {
    logger("reload exchange info")
    yield put(actions.Layout.addBackgroundLoading("loadMarketplaceInfo", "ARK:LOAD_MARKETPLACE_INFO"));
    const { network } = getBlockchain(yield select());

    const arkClient = new ArkClient(network);
    const exchangeInfo = (yield call(arkClient.getExchangeInfo)) as ArkExchangeInfo;
    exchangeInfo.denoms = exchangeInfo.denoms.map(address => toBech32Address(address));
    yield put(actions.MarketPlace.updateExchangeInfo(exchangeInfo));

  } catch (error) {
    console.error("loading profile failed, Error:")
    console.error(error)
  } finally {
    yield put(actions.Layout.removeBackgroundLoading("ARK:LOAD_MARKETPLACE_INFO"));
  }
}

function* listenPendingTx(action: any) {
  const pendingTx: ArkPendingTx = action.payload;

  yield put(actions.MarketPlace.addPendingTx(pendingTx));

  try {
    yield call(waitForTx, pendingTx.txHash, 500, 1000);

    yield delay(3000);

    const { bidsTable, exchangeInfo } = getMarketplace(yield select());
    const { network } = getBlockchain(yield select());

    if (bidsTable && exchangeInfo) {
      const arkClient = new ArkClient(network);
      const { bids, ...listFilter } = bidsTable;
      const result = (yield arkClient.listNftCheques(listFilter) as any)

      yield put(actions.MarketPlace.updateBidsTable({
        bids: result.result.entries,
        ...listFilter,
      }));
    }
  } catch (error) {
    console.error("listening to tx failed");
    console.error(error);
  } finally {
    yield put(actions.MarketPlace.removePendingTx(pendingTx));
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
  yield takeLatest([
    actions.MarketPlace.MarketPlaceActionTypes.LOAD_PROFILE,
    actions.MarketPlace.MarketPlaceActionTypes.UPDATE_ACCESS_TOKEN,
  ], loadProfile);
}

function* watchExchangeInfo() {
  yield takeLatest([
    actions.Blockchain.BlockchainActionTypes.SET_NETWORK,
    actions.Blockchain.BlockchainActionTypes.INITIALIZED,
  ], reloadExchangeInfo);
}

function* watchPendingTxs() {
  yield takeEvery(actions.MarketPlace.MarketPlaceActionTypes.LISTEN_PENDING_TX, listenPendingTx);
}


export default function* marketPlaceSaga() {
  logger("init marketplace saga");
  yield fork(watchExchangeInfo);
  yield fork(watchProfileLoad);
  yield fork(watchLoadNftList);
  yield fork(watchPendingTxs);
}
