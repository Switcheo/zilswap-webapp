import { WalletUpdateProps } from "./types";

export const WalletActionTypes = {
  WALLET_UPDATE: "WALLET_UPDATE",
  WALLET_LOGOUT: "WALLET_LOGOUT",
};

export function update(payload: WalletUpdateProps) {
  return {
    type: WalletActionTypes.WALLET_UPDATE,
    payload
  }
};

export function logout() {
  return {
    type: WalletActionTypes.WALLET_LOGOUT,
  }
};
