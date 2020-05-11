import { OpenCloseState } from "../layout/types";
import { WalletState } from "./types";
import { Dispatch } from "redux";
import WalletService from "core/wallet";
import { ConnectWalletResult, ConnectedWallet } from "core/wallet/ConnectedWallet";

export const TYPES = {
  TOGGLE_CONNECT_WALLET: "TOGGLE_CONNECT_WALLET",
  UPDATE_WALLET: "UPDATE_WALLET",
};

export enum WalletActionTypes {
  UPDATE = "WALLET_UPDATE", LOGOUT = "WALLET_LOGOUT"
}

export function init(pk: string) {
  return async (dispatch: Dispatch) => {
    let wallet;
    if (pk) {
      wallet = await WalletService.connectWalletPrivateKey(pk);
    }
    if (wallet) {
      dispatch(update({ ...wallet, currencies: { ZIL: +(wallet.wallet!.balance) } }))
    }
  }
}

export function update(payload: WalletState) {
  return {
    type: WalletActionTypes.UPDATE,
    payload
  }
}

export function toggleConnectWallet(override?: OpenCloseState) {
  return {
    type: TYPES.TOGGLE_CONNECT_WALLET,
    override
  }
};

export function logout() {
  return {
    type: WalletActionTypes.LOGOUT
  }
}