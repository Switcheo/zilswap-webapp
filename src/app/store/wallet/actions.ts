import { BridgeWalletUpdateProps, WalletUpdateProps } from "./types";

export const WalletActionTypes = {
  WALLET_UPDATE: "WALLET_UPDATE",
  SET_BRIDGE_WALLET: "SET_BRIDGE_WALLET",
};

export type WalletAction = ReturnType<typeof update>
export function update(payload: WalletUpdateProps) {
  return {
    type: WalletActionTypes.WALLET_UPDATE,
    payload
  }
};

export type BridgeWalletAction = ReturnType<typeof setBridgeWallet>
export function setBridgeWallet(payload: BridgeWalletUpdateProps) {
  return {
    type: WalletActionTypes.SET_BRIDGE_WALLET,
    payload
  }
};
