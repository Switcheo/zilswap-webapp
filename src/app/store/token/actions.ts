import { TokenUpdateProps, TokenInitProps } from "./types";

export const Types = {
  TOKEN_UPDATE: "TOKEN_UPDATE",
  TOKEN_INIT: "TOKEN_INIT",
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