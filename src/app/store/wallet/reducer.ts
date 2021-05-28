import { ConnectedWallet, WalletConnectType } from "core/wallet";
import { LocalStorageKeys } from "app/utils/constants";
import { WalletActionTypes } from "./actions";
import { WalletState } from "./types";

const initial_state: WalletState = {
  wallet: null,
};

const reducer = (state: WalletState = initial_state, action: any) => {
  switch (action.type) {
    case WalletActionTypes.WALLET_UPDATE:
      const { payload } = action;
      const wallet: ConnectedWallet | null = payload.wallet;
      switch (wallet?.type) {
        case WalletConnectType.ZilPay:
          localStorage.setItem(LocalStorageKeys.ZilPayConnected, "true");
          break;
        case WalletConnectType.PrivateKey:
          localStorage.setItem(LocalStorageKeys.PrivateKey, wallet.addressInfo.privateKey!);
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
