import WalletService from "core/wallet";
import TokenService from "core/token";
import { Dispatch } from "redux";
import { OpenCloseState } from "../layout/types";
import { WalletState } from "./types";
import { getZilliqa } from "core/zilliqa";
import { BigNumber } from "bignumber.js";
import { actions } from "app/store";

export const TYPES = {
  TOGGLE_CONNECT_WALLET: "TOGGLE_CONNECT_WALLET",
  UPDATE_WALLET: "UPDATE_WALLET",
};

export enum WalletActionTypes {
  UPDATE = "WALLET_UPDATE", LOGOUT = "WALLET_LOGOUT", LOAD = "LOAD",
  UPDATE_CURRENCY = "UPDATE_CURRENCY", UPDATE_CURRENCY_POOL = "UPDATE_CURRENCY_POOL"
}

export function init(pk: string) {
  return async (dispatch: Dispatch) => {
    let wallet;
    dispatch({ type: WalletActionTypes.LOAD });
    if (pk) {
      wallet = await WalletService.connectWalletPrivateKey(pk, dispatch);
    }
    if (wallet) {
      dispatch(update({ ...wallet, currencies: { ZIL: +(wallet.wallet!.balance) } }));
      //@ts-ignore
      await TokenService.getAllBalances(dispatch);
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