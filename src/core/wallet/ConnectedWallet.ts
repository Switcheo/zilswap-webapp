import moment from "moment";
import { WalletProvider } from "zilswap-sdk";
import { Network } from "zilswap-sdk/lib/constants";

export type ConnectOptionType = "zilpay" | "privateKey" | "zeeves";

export enum WalletConnectType {
  Moonlet, PrivateKey, ZilPay, Zeeves
};

export type WalletAccountInfo = {
  byte20: string;
  bech32: string;
  privateKey?: string;
};

export type ConnectedWallet = {
  provider?: WalletProvider;
  type: WalletConnectType;
  network: Network;

  timestamp: moment.Moment;
  addressInfo: WalletAccountInfo;
};

export type ConnectWalletResult = {
  wallet?: ConnectedWallet;
  error?: any;
};
