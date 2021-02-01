import { WalletActionTypes } from "./actions";
import { WalletState } from "./types";
import { LocalStorageKeys } from "app/utils/constants";

const initial_state: WalletState = {
  wallet: undefined,
  privateKey: undefined,
  zilpay: undefined,
};

const reducer = (state: WalletState = initial_state, action: any) => {
  switch (action.type) {
    case WalletActionTypes.WALLET_UPDATE:
      const { payload } = action;
      const { privateKey, zilpay } = payload;
      if (privateKey) localStorage.setItem(LocalStorageKeys.PrivateKey, privateKey);
      if (zilpay) localStorage.setItem(LocalStorageKeys.ZilPayConnected, "true");
      return { ...state, ...payload };

    case WalletActionTypes.WALLET_LOGOUT:
      localStorage.removeItem(LocalStorageKeys.PrivateKey);
      localStorage.removeItem(LocalStorageKeys.ZilPayConnected);
      return { ...initial_state, pk: "" };
    default:
      return state;
  };
}

export default reducer;
