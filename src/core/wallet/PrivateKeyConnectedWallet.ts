import { Account } from "@zilliqa-js/account/dist/account";
import { DefaultFallbackNetwork } from "app/utils/constants";
import dayjs, { Dayjs } from "dayjs";
import { Network } from "zilswap-sdk/lib/constants";
import { ConnectedWallet, WalletAccountInfo, WalletConnectType } from "./ConnectedWallet";

export interface PrivateKeyConnectProps {
  network?: Network;
  timestamp?: Dayjs;
};
export class PrivateKeyConnectedWallet implements ConnectedWallet {
  type = WalletConnectType.PrivateKey;

  network: Network;

  timestamp: Dayjs;
  addressInfo: WalletAccountInfo;

  constructor(account: Account, props: PrivateKeyConnectProps = {}) {
    this.network = props.network || DefaultFallbackNetwork;
    this.timestamp = props.timestamp || dayjs();
    this.addressInfo = {
      bech32: account.bech32Address,
      byte20: account.address,
      privateKey: account.privateKey,
    };
  }
}
