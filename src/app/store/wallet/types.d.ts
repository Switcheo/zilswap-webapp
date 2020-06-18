import { ConnectedWallet } from "core/wallet/wallet";
import { BigNumber } from "bignumber.js";

export interface WalletState {
  wallet?: ConnectedWallet;
  pk?: string;
  zilpay?: boolean;
};

export interface WalletUpdateProps {
  wallet?: ConnectedWallet;
  pk?: string;
  zilpay?: boolean;
};