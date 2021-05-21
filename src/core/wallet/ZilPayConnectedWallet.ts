import dayjs, { Dayjs } from "dayjs";
import { WalletProvider } from "zilswap-sdk";
import { Network } from "zilswap-sdk/lib/constants";
import { ConnectedWallet, WalletAccountInfo, WalletConnectType } from "./ConnectedWallet";

export interface ZilPayConnectProps {
  zilpay: WalletProvider;
  network: Network;
  timestamp?: Dayjs;
  bech32: string;
  base16: string;
};
export class ZilPayConnectedWallet implements ConnectedWallet {
  type = WalletConnectType.ZilPay;

  provider: WalletProvider;
  network: Network;

  timestamp: Dayjs;
  addressInfo: WalletAccountInfo;

  constructor(props: ZilPayConnectProps) {
    this.provider = props.zilpay;
    this.network = props.network;
    this.timestamp = props.timestamp || dayjs();
    this.addressInfo = {
      bech32: props.bech32,
      byte20: props.base16,
    };
  }
}