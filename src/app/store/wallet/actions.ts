import { connectWalletPrivateKey } from "core/wallet";
import { Dispatch } from "redux";
import { OpenCloseState } from "../layout/types";
import { WalletUpdatePayload } from "./types";

export const TYPES = {
  TOGGLE_CONNECT_WALLET: "TOGGLE_CONNECT_WALLET",
  UPDATE_WALLET: "UPDATE_WALLET",
};

export enum WalletActionTypes {
  UPDATE = "WALLET_UPDATE", LOGOUT = "WALLET_LOGOUT", LOAD = "LOAD",
  UPDATE_CURRENCY = "UPDATE_CURRENCY", UPDATE_CURRENCY_POOL = "UPDATE_CURRENCY_POOL"
}

export function init(privateKey?: string) {
  return async (dispatch: Dispatch) => {
    let wallet;
    dispatch({ type: WalletActionTypes.LOAD });
    if (privateKey) {
      wallet = await connectWalletPrivateKey(privateKey);
    }
    if (wallet) {
      //@ts-ignore
      dispatch(update({ ...wallet }));
      dispatch(update_currency_balance({ currency: "ZIL", balance: wallet.wallet!.balance }));
    }
  }
}

export function update(payload: WalletUpdatePayload) {
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

export function update_currency_balance(payload: any) {
  return {
    type: WalletActionTypes.UPDATE_CURRENCY,
    payload
  }
}

export function update_currency_pool(payload: any) {
  return {
    type: WalletActionTypes.UPDATE_CURRENCY_POOL,
    payload
  }
}

export function logout() {
  return {
    type: WalletActionTypes.LOGOUT
  }
}