import dayjs, { Dayjs } from "dayjs";
import { WalletProvider } from "zilswap-sdk";
import { Network } from "zilswap-sdk/lib/constants";
import {
  ConnectedWallet,
  WalletAccountInfo,
  WalletConnectType,
} from "./ConnectedWallet";

export interface Z3WalletConnectProps {
  z3wallet: WalletProvider;
  network: Network;
  timestamp?: Dayjs;
  bech32: string;
  base16: string;
}
export class Z3WalletConnectedWallet implements ConnectedWallet {
  type = WalletConnectType.Z3Wallet;

  provider: WalletProvider;
  network: Network;

  timestamp: Dayjs;
  addressInfo: WalletAccountInfo;

  constructor(props: Z3WalletConnectProps) {
    this.provider = props.z3wallet;
    this.network = props.network;
    this.timestamp = props.timestamp || dayjs();
    this.addressInfo = {
      bech32: props.bech32,
      byte20: props.base16,
    };
  }
}
