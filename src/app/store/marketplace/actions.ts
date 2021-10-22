import { CollectionFilter, CollectionTrait } from "../types"
import { Nft, OAuth, PaginatedList, Profile } from "./types"

export enum SortBy {
  PriceDescending,
  PriceAscending,
  RarityDescending,
  RarityAscending,
  MostRecent,
  MostLoved,
  MostViewed
}

export const MarketPlaceActionTypes = {
  INITIALIZE: "INITIALIZE",
  LOAD_PROFILE: "LOAD_PROFILE",
  UPDATE_PROFILE: "UPDATE_PROFILE",
  UPDATE_TOKENS: "UPDATE_TOKENS",
  UPDATE_ACCESS_TOKEN: "UPDATE_ACCESS_TOKEN",
  REFRESH_ACCESS_TOKEN: "REFRESH_ACCESS_TOKEN",
  UPDATE_COLLECTION: "UPDATE_COLLECTION",
  UPDATE_FILTER: "UPDATE_FILTER",
  UPDATE_COLLECTION_TRAITS: "UPDATE_COLLECTION_TRAITS",
  RELOAD_TOKEN_LIST: "RELOAD_TOKEN_LIST",
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

export function updateProfile(payload: Profile) {
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

export function updateFilter(payload: Partial<CollectionFilter>) {
  return {
    type: MarketPlaceActionTypes.UPDATE_FILTER,
    payload
  }
}

export function updateTokens(payload: PaginatedList<Nft>) {
  return {
    type: MarketPlaceActionTypes.UPDATE_TOKENS,
    payload
  }
}

export function reloadTokenList() {
  return {
    type: MarketPlaceActionTypes.RELOAD_TOKEN_LIST,
  }
}

export function updateCollectionTraits(payload: { address: string, traits: CollectionTrait[] }) {
  return {
    type: MarketPlaceActionTypes.UPDATE_COLLECTION_TRAITS,
    payload
  }
}
