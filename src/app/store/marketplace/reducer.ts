import { MarketPlaceActionTypes } from "./actions";
import { MarketPlaceState } from "./types";
import { LocalStorageKeys } from "app/utils/constants";

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
  tokens: {},
  oAuth: savedAccessToken,
  filter: {
    sale_type: {
      fixed_price: true,
      timed_auction: true
    },
    traits: {},
  },
  profile: undefined,
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
      return {
        ...state,
        tokens: payload,
      }
    case MarketPlaceActionTypes.UPDATE_FILTER:
      return {
        ...state,
        filter: payload
      }
    default:
      return state;
  }
}

export default reducer;
