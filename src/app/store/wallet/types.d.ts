import { ConnectedWallet } from "core/wallet/wallet";

export interface WalletState {
  wallet?: ConnectedWallet;
  currencies?: WalletCurrencies;
  pk?: string,
};

export interface WalletUpdatePayload {
  wallet?: ConnectedWallet;
  currencies?: WalletCurrencies;
  pk?: string,
}

export interface WalletCurrencies {
  [key: string]: WalletCurrency
}

export interface WalletCurrency {
  balance: number
}

export interface PoolUpdateExtendedPayload {
  key: string;
  value: any;
}
