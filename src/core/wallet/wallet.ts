import { Currency } from "core/currency";

export enum WalletConnectType {
  Moonlet, PrivateKey
}

export type ConnectedWallet = {
  currency: Currency;
  balance: number;
  type: WalletConnectType;
  // ...
}

export type ConnectWalletResult = {
  wallet?: ConnectedWallet;
  // ...
}

export const connectWalletMoonlet = async (): Promise<ConnectWalletResult> => {
  return {};
}
export const connectWalletPrivateKey = async (privateKey: string): Promise<ConnectWalletResult> => {
  return {};
}