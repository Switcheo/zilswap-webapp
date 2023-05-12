import { take } from "redux-saga/effects";
import { WalletAction, WalletActionTypes } from "app/store/wallet/actions";

export function* waitForWalletChange(walletAddress?: string): Generator<any, string | undefined, any> {
  while (true) {
    const action = (yield take(WalletActionTypes.WALLET_UPDATE)) as WalletAction;
    const newWalletAddress = action.payload?.wallet?.addressInfo.bech32 ?? undefined;
    if (newWalletAddress !== walletAddress) return newWalletAddress;
  }
}
