import WalletService from "core/wallet";
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
  UPDATE = "WALLET_UPDATE", LOGOUT = "WALLET_LOGOUT", LOAD = "LOAD"
}

export function init(pk: string) {
  return async (dispatch: Dispatch) => {
    let wallet;
    dispatch({ type: WalletActionTypes.LOAD });
    if (pk) {
      wallet = await WalletService.connectWalletPrivateKey(pk);
      const zilliqa = getZilliqa();
      await zilliqa.initialize();
      const pool = await zilliqa.getPool("ITN");
      let { contributionPercentage, exchangeRate, tokenReserve, totalContribution, userContribution, zilReserve } = pool;

      contributionPercentage = new BigNumber(contributionPercentage).toString();
      exchangeRate = new BigNumber(exchangeRate).toString();
      tokenReserve = new BigNumber(tokenReserve).toString();
      totalContribution = new BigNumber(totalContribution).toString();
      userContribution = new BigNumber(userContribution).toString();
      zilReserve = new BigNumber(zilReserve).toString();

      dispatch(actions.Pool.update_pool({ contributionPercentage, exchangeRate, tokenReserve, totalContribution, userContribution, zilReserve }));
      await zilliqa.teardown();
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