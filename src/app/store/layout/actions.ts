import { OpenCloseState } from "./types";

export const TYPES = {
  TOGGLE_SHOW_WALLET: "TOGGLE_SHOW_WALLET",
  ADD_BACKGROUND_LOADING: "ADD_BACKGROUND_LOADING",
  REMOVE_BACKGROUND_LOADING: "REMOVE_BACKGROUND_LOADING",
};

export function toggleShowWallet(override?: OpenCloseState) {
  return {
    type: TYPES.TOGGLE_SHOW_WALLET,
    override
  }
};

export function addBackgroundLoading(name: string, uuid: string) {
  return {
    type: TYPES.ADD_BACKGROUND_LOADING,
    name, uuid,
  };
};
export function removeBackgroundLoading(uuid: string) {
  return {
    type: TYPES.REMOVE_BACKGROUND_LOADING,
    uuid,
  };
};