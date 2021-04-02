import { ConnectedWallet } from "core/wallet";

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
