import { OpenCloseState } from "./types";

export const TYPES = {
  TOGGLE_SHOW_WALLET: "TOGGLE_SHOW_WALLET",
};

export function toggleShowWallet(override?: OpenCloseState) {
  return {
    type: TYPES.TOGGLE_SHOW_WALLET,
    override
  }
};