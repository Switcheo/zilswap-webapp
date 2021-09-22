export const MarketPlaceActionTypes = {
  INITIALIZE: "INITIALIZE",
  LOAD_PROFILE: "LOAD_PROFILE",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  UPDATE_TOKEN: "UPDATE_TOKEN",
  UPDATE_COLLECTION: "UPDATE_COLLECTION",
  UPDATE_FILTER: "UPDATE_FILTER",
}

export function initialize() {
  return { type: MarketPlaceActionTypes.INITIALIZE }
}

export function loadProfile() {
  return { type: MarketPlaceActionTypes.LOAD_PROFILE }
}

export function updateProfile(payload: {}) {
  return {
    type: MarketPlaceActionTypes.UPDATE_PROFILE,
    payload
  }
}

