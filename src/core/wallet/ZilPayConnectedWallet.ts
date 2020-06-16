import moment from "moment";
import { Network } from "zilswap-sdk/lib/constants";
import { Provider } from "../zilswap";
import { ConnectedWallet, WalletAccountInfo, WalletConnectType } from "./ConnectedWallet";

export interface ZilPayConnectProps {
  provider: Provider;
  network?: Network;
  timestamp?: moment.Moment;
  bech32: string;
  base16: string;
};
export class ZilPayConnectedWallet implements ConnectedWallet {
  type = WalletConnectType.ZilPay;

  provider: Provider;
  network: Network;

  timestamp: moment.Moment;
  addressInfo: WalletAccountInfo;

  constructor(props: ZilPayConnectProps) {
    this.provider = props.provider;
    this.network = props.network || Network.TestNet;
    this.timestamp = props.timestamp || moment();
    this.addressInfo = {
      bech32: props.bech32,
      byte20: props.base16,
    };
  }
}