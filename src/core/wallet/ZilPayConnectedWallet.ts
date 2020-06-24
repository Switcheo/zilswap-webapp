import moment from "moment";
import { WalletProvider } from "zilswap-sdk";
import { Network } from "zilswap-sdk/lib/constants";
import { ConnectedWallet, WalletAccountInfo, WalletConnectType } from "./ConnectedWallet";

export interface ZilPayConnectProps {
  zilpay: WalletProvider;
  network: Network;
  timestamp?: moment.Moment;
  bech32: string;
  base16: string;
};
export class ZilPayConnectedWallet implements ConnectedWallet {
  type = WalletConnectType.ZilPay;

  provider: WalletProvider;
  network: Network;

  timestamp: moment.Moment;
  addressInfo: WalletAccountInfo;

  constructor(props: ZilPayConnectProps) {
    this.provider = props.zilpay;
    this.network = props.network;
    this.timestamp = props.timestamp || moment();
    this.addressInfo = {
      bech32: props.bech32,
      byte20: props.base16,
    };
  }
}