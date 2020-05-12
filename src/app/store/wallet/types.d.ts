import { ConnectedWallet } from "core/wallet/wallet";

export interface WalletState {
  wallet?: ConnectedWallet;
  currencies: WalletCurrencies;
  pk?: string,
};

export interface WalletCurrencies {
  [key: string]: number;
}

export interface PoolUpdateExtendedPayload {
  key: string;
  value: any;
}
