import { SimpleMap } from "app/utils"
import { ArkExchangeInfo } from "core/utilities"
import { CollectionFilter } from "../types"
import { ArkPendingTx, BidsTableInfo, Collection, OAuth, Profile, QueryNftResult, TraitType } from "./types"

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
  INITIALIZE: "ARK:INITIALIZE",
  LOAD_PROFILE: "ARK:LOAD_PROFILE",
  UPDATE_PROFILE: "ARK:UPDATE_PROFILE",
  UPDATE_TOKENS: "ARK:UPDATE_TOKENS",
  APPEND_TOKENS: "ARK:APPEND_TOKENS",
  UPDATE_ACCESS_TOKEN: "ARK:UPDATE_ACCESS_TOKEN",
  REFRESH_ACCESS_TOKEN: "ARK:REFRESH_ACCESS_TOKEN",
  UPDATE_COLLECTION: "ARK:UPDATE_COLLECTION",
  UPDATE_FILTER: "ARK:UPDATE_FILTER",
  UPDATE_COLLECTION_TRAITS: "ARK:UPDATE_COLLECTION_TRAITS",
  UPDATE_EXCHANGE_INFO: "ARK:UPDATE_EXCHANGE_INFO",
  RELOAD_TOKEN_LIST: "ARK:RELOAD_TOKEN_LIST",

  UPDATE_BIDS_TABLE_INFO: "ARK:UPDATE_BIDS_TABLE_INFO",
  REMOVE_PENDING_TX: "ARK:REMOVE_PENDING_TX",
  ADD_PENDING_TX: "ARK:ADD_PENDING_TX",
  LISTEN_PENDING_TX: "ARK:LISTEN_PENDING_TX",
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

export function updateExchangeInfo(payload: ArkExchangeInfo) {
  return {
    type: MarketPlaceActionTypes.UPDATE_EXCHANGE_INFO,
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

export function updateTokens(payload: QueryNftResult) {
  return {
    type: MarketPlaceActionTypes.UPDATE_TOKENS,
    payload
  }
}

export function appendTokens(payload: QueryNftResult) {
  return {
    type: MarketPlaceActionTypes.APPEND_TOKENS,
    payload
  }
}

export function reloadTokenList() {
  return {
    type: MarketPlaceActionTypes.RELOAD_TOKEN_LIST,
  }
}

export function updateCollectionTraits(payload: { traits: SimpleMap<TraitType>, collection: Collection }) {
  return {
    type: MarketPlaceActionTypes.UPDATE_COLLECTION_TRAITS,
    payload
  }
}

export function updateBidsTable(payload?: BidsTableInfo) {
  return {
    type: MarketPlaceActionTypes.UPDATE_BIDS_TABLE_INFO,
    payload
  }
}

export function addPendingTx(payload: ArkPendingTx) {
  return {
    type: MarketPlaceActionTypes.ADD_PENDING_TX,
    payload
  }
}

export function removePendingTx(payload: ArkPendingTx) {
  return {
    type: MarketPlaceActionTypes.REMOVE_PENDING_TX,
    payload
  }
}

export function listenPendingTx(payload: ArkPendingTx) {
  return {
    type: MarketPlaceActionTypes.LISTEN_PENDING_TX,
    payload
  }
}
