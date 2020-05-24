import { ConnectedWallet } from "core/wallet/wallet";
import { BigNumber } from "bignumber.js";

export interface WalletState {
  wallet?: ConnectedWallet;
  pk?: string,
};

export interface WalletUpdateProps {
  wallet?: ConnectedWallet;
  pk?: string,
};