import { SimpleMap } from "app/utils"
import { Nft, OAuth } from "./types"

export const MarketPlaceActionTypes = {
  INITIALIZE: "INITIALIZE",
  LOAD_PROFILE: "LOAD_PROFILE",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  UPDATE_TOKENS: "UPDATE_TOKENS",
  UPDATE_ACCESS_TOKEN: "UPDATE_ACCESS_TOKEN",
  REFRESH_ACCESS_TOKEN: "REFRESH_ACCESS_TOKEN",
  UPDATE_COLLECTION: "UPDATE_COLLECTION",
  UPDATE_FILTER: "UPDATE_FILTER",
}

export function initialize() {
  return { type: MarketPlaceActionTypes.INITIALIZE }
}
export function loadProfile() {
  return { type: MarketPlaceActionTypes.LOAD_PROFILE }
}
export function refreshAccessToken() {
  return { type: MarketPlaceActionTypes.REFRESH_ACCESS_TOKEN }
}

export function updateProfile(payload: {}) {
  return {
    type: MarketPlaceActionTypes.UPDATE_PROFILE,
    payload
  }
}

export function updateAccessToken(payload: OAuth) {
  return {
    type: MarketPlaceActionTypes.UPDATE_ACCESS_TOKEN,
    payload
  }
}

export function updateTokens(payload: SimpleMap<Nft>) {
  return {
    type: MarketPlaceActionTypes.UPDATE_TOKENS,
    payload
  }
}