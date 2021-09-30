import dayjs, { Dayjs } from "dayjs";
import { WalletProvider } from "zilswap-sdk";
import { Network } from "zilswap-sdk/lib/constants";
import {
  ConnectedWallet,
  WalletAccountInfo,
  WalletConnectType,
} from "./ConnectedWallet";

export interface BoltXConnectProps {
  boltX: WalletProvider;
  network: Network;
  timestamp?: Dayjs;
  bech32: string;
  base16: string;
}
export class BoltXConnectedWallet implements ConnectedWallet {
  type = WalletConnectType.BoltX;

  provider: WalletProvider;
  network: Network;

  timestamp: Dayjs;
  addressInfo: WalletAccountInfo;

  constructor(props: BoltXConnectProps) {
    this.provider = props.boltX;
    this.network = props.network;
    this.timestamp = props.timestamp || dayjs();
    this.addressInfo = {
      bech32: props.bech32,
      byte20: props.base16,
    };
  }
}
