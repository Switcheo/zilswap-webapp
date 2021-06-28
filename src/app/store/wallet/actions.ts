import { Blockchain } from "tradehub-api-js";
import { WalletUpdateProps } from "./types";

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

export function setBridgeWallet(payload: { blockchain: Blockchain, address: string}) {
  return {
    type: WalletActionTypes.SET_BRIDGE_WALLET,
    payload
  }
};
