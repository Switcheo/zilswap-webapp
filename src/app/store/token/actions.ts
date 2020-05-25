import { TokenUpdateProps, TokenInitProps, TokenAddProps } from "./types";

export const Types = {
  TOKEN_UPDATE: "TOKEN_UPDATE",
  TOKEN_INIT: "TOKEN_INIT",
  TOKEN_ADD: "TOKEN_ADD",
};

export function update(payload: TokenUpdateProps) {
  return {
    type: Types.TOKEN_UPDATE,
    payload
  }
};
export function init(payload: TokenInitProps) {
  return {
    type: Types.TOKEN_INIT,
    payload
  }
};
export function add(payload: TokenAddProps) {
  return {
    type: Types.TOKEN_ADD,
    payload
  }
};