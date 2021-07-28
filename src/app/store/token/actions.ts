import {
  TokenInitProps, TokenUpdateProps, TokenUpdateAllProps,
  TokenAddProps, UpdatePriceProps, UpdateUSDValuesProps,
} from "./types";

export const TokenActionTypes = {
  TOKEN_INIT: "TOKEN_INIT",
  TOKEN_ADD: "TOKEN_ADD",
  TOKEN_REFETCH_STATE: "TOKEN_REFETCH_STATE",
  TOKEN_UPDATE: "TOKEN_UPDATE",
  TOKEN_UPDATE_ALL: "TOKEN_UPDATE_ALL",
  TOKEN_UPDATE_PRICES: "TOKEN_UPDATE_PRICES",
  TOKEN_UPDATE_USD: "TOKEN_UPDATE_USD",
  TOKEN_UPDATE_USER_SAVED: "TOKEN_UPDATE_USER_SAVED",
};

export function init(payload: TokenInitProps) {
  return {
    type: TokenActionTypes.TOKEN_INIT,
    payload,
  }
};
export function add(payload: TokenAddProps) {
  return {
    type: TokenActionTypes.TOKEN_ADD,
    payload,
  }
};
export function refetchState() {
  return {
    type: TokenActionTypes.TOKEN_REFETCH_STATE,
  }
};
export function update(payload: TokenUpdateProps) {
  return {
    type: TokenActionTypes.TOKEN_UPDATE,
    payload,
  }
};
export function updateAll(payload: TokenUpdateAllProps) {
  return {
    type: TokenActionTypes.TOKEN_UPDATE_ALL,
    payload,
  }
};
export function updatePrices(payload: UpdatePriceProps) {
  return {
    type: TokenActionTypes.TOKEN_UPDATE_PRICES,
    payload,
  }
};
export function updateUSDValues(payload: UpdateUSDValuesProps) {
  return {
    type: TokenActionTypes.TOKEN_UPDATE_USD,
    payload,
  }
};
export function updateUserSavedTokens(payload: string) {
  return {
    type: TokenActionTypes.TOKEN_UPDATE_USER_SAVED,
    payload,
  }
};
