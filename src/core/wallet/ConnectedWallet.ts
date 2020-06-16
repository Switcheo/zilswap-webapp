import moment from "moment";
import { Network } from "zilswap-sdk/lib/constants";
import { Provider } from "../zilswap";

export type ConnectOptionType = "zilpay" | "privateKey";

export enum WalletConnectType {
  Moonlet, PrivateKey, ZilPay
};

export type WalletAccountInfo = {
  byte20: string;
  bech32: string;
  privateKey?: string;
};

export type ConnectedWallet = {
  provider?: Provider;
  type: WalletConnectType;
  network: Network;

  timestamp: moment.Moment;
  addressInfo: WalletAccountInfo;
};

export type ConnectWalletResult = {
  wallet?: ConnectedWallet;
  error?: any;
};
