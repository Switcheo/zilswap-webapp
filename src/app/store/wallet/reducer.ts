import { ConnectedWallet, WalletConnectType } from "core/wallet";
import { LocalStorageKeys } from "app/utils/constants";
import { WalletActionTypes } from "./actions";
import { WalletState } from "./types";

const initial_state: WalletState = {
  wallet: null,
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
      const wallet: ConnectedWallet | null = payload.wallet;
      switch (wallet?.type) {
        case WalletConnectType.ZilPay:
          localStorage.setItem(LocalStorageKeys.PrivateKey, wallet.addressInfo.privateKey!);
          break;
        case WalletConnectType.PrivateKey:
          localStorage.setItem(LocalStorageKeys.ZilPayConnected, "true");
          break;
        case WalletConnectType.Zeeves:
          logoutRemovedKeys.forEach(key => localStorage.removeItem(key));
          localStorage.setItem(LocalStorageKeys.ZeevesConnected, "true");
          break;
        default:
          localStorage.removeItem(LocalStorageKeys.PrivateKey);
          localStorage.removeItem(LocalStorageKeys.ZilPayConnected);
      }
      return { ...state, ...payload };
    default:
      return state;
  };
}

export default reducer;
