import { Blockchain } from "carbon-js-sdk";
import { ConnectedWallet, WalletConnectType } from "core/wallet";
import { LocalStorageKeys } from "app/utils/constants";
import { WalletActionTypes } from "./actions";
import { WalletState } from "./types";

const initial_state: WalletState = {
  wallet: null,
  bridgeWallets: {
    [Blockchain.Ethereum]: null,
  },
};

const logoutRemovedKeys: string[] = [
  LocalStorageKeys.PrivateKey,
  LocalStorageKeys.ZilPayConnected,
];

const reducer = (state: WalletState = initial_state, action: any) => {
  switch (action.type) {
    case WalletActionTypes.WALLET_UPDATE: {
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
          logoutRemovedKeys.forEach(key => localStorage.removeItem(key));
      }
      return { ...state, ...payload };
    }
    case WalletActionTypes.SET_BRIDGE_WALLET: {
      const { payload } = action;
      switch (payload.blockchain) {
        case Blockchain.Ethereum:
        case Blockchain.Arbitrum:
        case Blockchain.BinanceSmartChain:
          return { ...state, bridgeWallets: { ...state.bridgeWallets, [payload.blockchain]: payload.wallet }}
        default:
          throw new Error(`Invalid blockchain in SET_BRIDGE_WALLET: ${payload.blockchain}`)
      }
    }
    default:
      return state;
  };
}

export default reducer;
