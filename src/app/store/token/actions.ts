import { TokenUpdateProps, TokenInitProps, TokenAddProps } from "./types";

export const TokenActionTypes = {
  TOKEN_UPDATE: "TOKEN_UPDATE",
  TOKEN_INIT: "TOKEN_INIT",
  TOKEN_ADD: "TOKEN_ADD",
  TOKEN_INVALIDATE: "TOKEN_INVALIDATE",
};

export function update(payload: TokenUpdateProps) {
  return {
    type: TokenActionTypes.TOKEN_UPDATE,
    payload
  }
};
export function init(payload: TokenInitProps) {
  return {
    type: TokenActionTypes.TOKEN_INIT,
    payload
  }
};
export function add(payload: TokenAddProps) {
  return {
    type: TokenActionTypes.TOKEN_ADD,
    payload
  }
};
export function invalidate() {
  return {
    type: TokenActionTypes.TOKEN_INVALIDATE,
  }
};