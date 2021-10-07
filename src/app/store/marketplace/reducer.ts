import { MarketPlaceActionTypes } from "./actions";
import { MarketPlaceState } from "./types";

const initial_state: MarketPlaceState = {
  collections: {},
  tokens: {},
  filter: {
    sale_type: {
      fixed_price: true,
      timed_auction: true
    },
    traits: {},
  },
  profile: {
    ownedNft: {}
  },
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