import { ConnectedWallet } from "core/wallet";

export interface WalletState {
  wallet: ConnectedWallet | null;
};

export interface WalletUpdateProps {
  wallet: ConnectedWallet | null;
};
