import { OpenCloseState } from "../layout/types";
import { ConnectedWallet, ConnectWalletResult } from "core/wallet/ConnectedWallet";

export const TYPES = {
  TOGGLE_CONNECT_WALLET: "TOGGLE_CONNECT_WALLET",
  UPDATE_WALLET: "UPDATE_WALLET"
};

export function toggleConnectWallet(override?: OpenCloseState) {
  return {
    type: TYPES.TOGGLE_CONNECT_WALLET,
    override
  }
};

export function updateWallet(payload?: ConnectedWallet) {
  return {
    type: TYPES.UPDATE_WALLET,
    payload
  }
}