import { WalletActionTypes } from "./actions";
import { WalletState } from "./types";
import { LocalStorageKeys } from "app/utils/constants";
import { WalletConnectType } from "core/wallet";

const initial_state: WalletState = {
  wallet: undefined,
  privateKey: undefined,
  zilpay: undefined,
};

const logoutRemovedKeys: string[] = [
  LocalStorageKeys.PrivateKey,
  LocalStorageKeys.ZilPayConnected,
  LocalStorageKeys.ZeevesConnected,
];

const reducer = (state: WalletState = initial_state, action: any) => {
  switch (action.type) {
    case WalletActionTypes.WALLET_UPDATE:
      const { payload } = action;
      const { wallet, privateKey, zilpay } = payload;
      if (privateKey) localStorage.setItem(LocalStorageKeys.PrivateKey, privateKey);
      if (zilpay) localStorage.setItem(LocalStorageKeys.ZilPayConnected, "true");
      if (wallet?.type === WalletConnectType.Zeeves) localStorage.setItem(LocalStorageKeys.ZeevesConnected, "true");
      return { ...state, ...payload };

    case WalletActionTypes.WALLET_LOGOUT:
      logoutRemovedKeys.forEach(key => localStorage.removeItem(key));
      return { ...initial_state, pk: "" };

    default:
      return state;
  };
}

export default reducer;
