import { LocalStorageKeys, COLLECTION_NFT_PER_PAGE, PROFILE_NFT_PER_PAGE } from "app/utils/constants";
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
    sale_type: {
      fixed_price: true,
      timed_auction: true
    },
    traits: {},
    sortBy: SortBy.PriceDescending,
    pagination: {
      limit: COLLECTION_NFT_PER_PAGE
    },
    filterPage: "collection"
  },
  filters: {
    collectionFilter: {
      sale_type: {
        fixed_price: true,
        timed_auction: true
      },
      traits: {},
      sortBy: SortBy.PriceDescending,
      pagination: {
        limit: COLLECTION_NFT_PER_PAGE
      },
      filterPage: "collection"
    },
    profileFilter: {
      sale_type: {
        fixed_price: true,
        timed_auction: true
      },
      traits: {},
      sortBy: SortBy.PriceDescending,
      pagination: {
        limit: PROFILE_NFT_PER_PAGE
      },
      filterPage: "profile"
    },
  },
  profile: undefined,
  profileTokens: [],
}




const reducer = (state: MarketPlaceState = initial_state, action: any) => {
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
      let allFilters = { ...state.filters };
      if (state.filter.filterPage === "collection") {
        allFilters = {
          ...allFilters, collectionFilter: {
            ...allFilters.collectionFilter,
            pagination: {
              ...allFilters.collectionFilter.pagination,
              ...payload.meta,
            }
          }
        }
      } else {
        allFilters = {
          ...allFilters, profileFilter: {
            ...allFilters.profileFilter,
            pagination: {
              ...allFilters.profileFilter.pagination,
              ...payload.meta,
            }
          }
        }
      }

      return {
        ...state,
        tokens: state.filter.filterPage === "collection" ? payload.entries : state.tokens,
        filter: {
          ...state.filter,
          pagination: {
            ...state.filter.pagination,
            ...payload.meta,
          }
        },
        filters: {
          ...state.filters,
          ...allFilters,
        },
        profileTokens: state.filter.filterPage === "profile" ? payload.entries : state.profileTokens
      }
    case MarketPlaceActionTypes.UPDATE_FILTER:
      let filters = state.filters;

      let toUpdate = {} as any;
      if (payload.filterPage === "collection") {
        toUpdate = { ...state.filters.collectionFilter, ...payload }
        filters = {
          ...filters,
          collectionFilter: {
            ...filters.collectionFilter,
            ...payload
          }
        }
      } else if (payload.filterPage === "profile") {
        toUpdate = { ...state.filters.profileFilter, ...payload }
        filters = {
          ...filters,
          profileFilter: {
            ...filters.profileFilter,
            ...payload
          }
        }
      } else {
        return { ...state }
      }

      return {
        ...state,
        filter: {
          ...toUpdate,
        },
        filters: {
          ...state.filters,
          ...filters
        }
      }
    default:
      return state;
  }
}

export default reducer;
