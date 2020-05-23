import moment from "moment";
import { BN } from "@zilliqa-js/util";
import { Network } from "zilswap-sdk/lib/constants";

export type ConnectOptionType = "moonlet" | "privateKey";

export enum WalletConnectType {
  Moonlet, PrivateKey
};

export type WalletAccountInfo = {
  byte20: string;
  bech32: string;
  privateKey?: string;
};

export type ConnectedWallet = {
  type: WalletConnectType;
  network: Network;

  balance: BN;
  timestamp: moment.Moment;
  addressInfo: WalletAccountInfo;
};

export type ConnectWalletResult = {
  wallet?: ConnectedWallet;
  error?: any;
};
