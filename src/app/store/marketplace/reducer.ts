import { LocalStorageKeys, COLLECTION_NFT_PER_PAGE } from "app/utils/constants";
import { SortBy, MarketPlaceActionTypes } from "./actions";
import { MarketPlaceState } from "./types";

const loadSavedAccessToken = () => {
  try {
    let saved = localStorage.getItem(LocalStorageKeys.ArkAccessToken)
    return JSON.parse(saved!);
  } catch (error) {
    return undefined;
  }
}

const savedAccessToken = loadSavedAccessToken()

const initial_state: MarketPlaceState = {
  collections: {},
  tokens: [],
  oAuth: savedAccessToken,
  filter: {
    saleType: {
      fixed_price: false,
      timed_auction: false,
    },
    collectionAddress: null,
    owner: null,
    likedBy: null,
    search: '',
    traits: {},
    sortBy: SortBy.PriceAscending,
    pagination: {
      limit: COLLECTION_NFT_PER_PAGE
    },
  },
  exchangeInfo: undefined,
  profile: undefined,
  collectionTraits: {},
  filteredTokensTraits: {},
  pendingTxs: {},
}

const reducer = (state: MarketPlaceState = initial_state, action: any): MarketPlaceState => {
  const { payload, type } = action;
  switch (type) {
    case MarketPlaceActionTypes.UPDATE_PROFILE:
      return {
        ...state,
        profile: {
          ...state.profile,
          ...payload,
        }
      }

    case MarketPlaceActionTypes.UPDATE_ACCESS_TOKEN:
      localStorage.setItem(LocalStorageKeys.ArkAccessToken, JSON.stringify(payload));
      return {
        ...state,
        oAuth: payload,
      }
    case MarketPlaceActionTypes.UPDATE_TOKENS:
      return {
        ...state,
        tokens: payload.entries,
        filteredTokensTraits: payload.traits ?? state.filteredTokensTraits,
        filter: {
          ...state.filter,
          pagination: {
            ...state.filter.pagination,
            ...payload.meta,
          }
        },
      }
    case MarketPlaceActionTypes.APPEND_TOKENS:
      return {
        ...state,
        tokens: [...state.tokens, ...payload.entries],
        filteredTokensTraits: payload.traits ?? state.filteredTokensTraits,
        filter: {
          ...state.filter,
          infinite: false,
          pagination: {
            ...state.filter.pagination,
            ...payload.meta,
            offset: 0,
          }
        },
      }
    case MarketPlaceActionTypes.UPDATE_EXCHANGE_INFO:
      return {
        ...state,
        exchangeInfo: payload,
      }
    case MarketPlaceActionTypes.UPDATE_FILTER:
      return {
        ...state,
        filter: {
          ...state.filter,
          ...payload,
        },
      }
    case MarketPlaceActionTypes.UPDATE_COLLECTION_TRAITS:
      return {
        ...state,
        collections: {
          ...state.collections,
          [payload.collection.address]: payload.collection,
        },
        collectionTraits: {
          ...state.collectionTraits,
          [payload.collection.address]: payload.traits,
        }
      }
    case MarketPlaceActionTypes.UPDATE_BIDS_TABLE_INFO: {
      return {
        ...state,
        bidsTable: payload,
      }
    }
    case MarketPlaceActionTypes.ADD_PENDING_TX: {
      if (state.pendingTxs[payload.txHash])
        return state;

      const pendingTxs = {
        ...state.pendingTxs,
        [payload.txHash]: payload,
      };
      return {
        ...state,
        pendingTxs,
      }
    }
    case MarketPlaceActionTypes.REMOVE_PENDING_TX: {
      const pendingTxs = { ...state.pendingTxs };
      delete pendingTxs[payload.txHash];
      return {
        ...state,
        pendingTxs,
      }
    }
    default:
      return state;
  }
}

export default reducer;
