import { TokenUpdateProps, TokenInitProps, TokenAddProps, UpdatePriceProps, UpdateUSDValuesProps } from "./types";

export const TokenActionTypes = {
  TOKEN_UPDATE_STATE: "TOKEN_UPDATE_STATE",
  TOKEN_INIT: "TOKEN_INIT",
  TOKEN_UPDATE: "TOKEN_UPDATE",
  TOKEN_ADD: "TOKEN_ADD",
  TOKEN_UPDATE_PRICES: "TOKEN_UPDATE_PRICES",
  TOKEN_UPDATE_VALUES: "TOKEN_UPDATE_VALUES",
};

export function updateState() {
  return {
    type: TokenActionTypes.TOKEN_UPDATE_STATE,
  }
};
export function init(payload: TokenInitProps) {
  return {
    type: TokenActionTypes.TOKEN_INIT,
    payload,
  }
};
export function update(payload: TokenUpdateProps) {
  return {
    type: TokenActionTypes.TOKEN_UPDATE,
    payload,
  }
};
export function add(payload: TokenAddProps) {
  return {
    type: TokenActionTypes.TOKEN_ADD,
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
    type: TokenActionTypes.TOKEN_UPDATE_VALUES,
    payload,
  }
};
