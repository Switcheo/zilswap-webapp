import { Blockchain } from "tradehub-api-js";
import { ConnectedWallet } from "core/wallet";
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";

export interface WalletState {
  wallet: ConnectedWallet | null;
  bridgeWallets: {
    [Blockchain.Ethereum]: ConnectedBridgeWallet | null;
  }
};

export interface WalletUpdateProps {
  wallet: ConnectedWallet | null;
};

export interface BridgeWalletUpdateProps {
  blockchain: Blockchain;
  wallet: ConnectedBridgeWallet | null;
}
