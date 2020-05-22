import { ConnectedWallet } from "core/wallet/wallet";
import { BigNumber } from "bignumber.js";

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
  balance: number,
  contributionPercentage?: BigNumber,
  exchangeRate?: number,
  tokenReserve?: BigNumber,
  totalContribution?: BigNumber,
  userContribution?: BigNumber,
  zilReserve?: BigNumber
}

export interface PoolUpdateExtendedPayload {
  key: string;
  value: any;
}
