import moment from "moment";
import { WalletProvider } from "zilswap-sdk";
import { Network } from "zilswap-sdk/lib/constants";
import { ConnectedWallet, WalletAccountInfo, WalletConnectType } from "./ConnectedWallet";

export interface ZeevesConnectProps {
  zeeves: WalletProvider;
  network: Network;
  timestamp?: moment.Moment;
  bech32: string;
  byte20: string;
};
export class ZeevesConnectedWallet implements ConnectedWallet {
  type = WalletConnectType.Zeeves;

  provider: WalletProvider;
  network: Network;

  timestamp: moment.Moment;
  addressInfo: WalletAccountInfo;

  constructor(props: ZeevesConnectProps) {
    this.provider = props.zeeves;
    this.network = props.network;
    this.timestamp = props.timestamp || moment();
    this.addressInfo = {
      bech32: props.bech32,
      byte20: props.byte20,
    };
  }
}