import { ConnectedWallet } from "core/wallet";
import { Blockchain } from "tradehub-api-js";

export interface WalletState {
  wallet: ConnectedWallet | null;
  bridgeWallets: {
    [Blockchain.Ethereum]: string | null;
  }
};

export interface WalletUpdateProps {
  wallet: ConnectedWallet | null;
};
