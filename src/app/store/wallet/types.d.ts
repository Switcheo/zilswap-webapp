import { ConnectedWallet } from "core/wallet";
import { BigNumber } from "bignumber.js";

export interface WalletState {
  wallet?: ConnectedWallet;
  privateKey?: string;
  zilpay?: boolean;
};

export interface WalletUpdateProps {
  wallet?: ConnectedWallet;
  privateKey?: string;
  zilpay?: boolean;
};
