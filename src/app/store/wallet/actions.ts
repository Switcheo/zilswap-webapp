import { WalletUpdateProps } from "./types";

export const WalletActionTypes = {
  WALLET_UPDATE: "WALLET_UPDATE",
};

export function update(payload: WalletUpdateProps) {
  return {
    type: WalletActionTypes.WALLET_UPDATE,
    payload
  }
};
