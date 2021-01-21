import { Account } from "@zilliqa-js/account";
import { DefaultFallbackNetwork } from "app/utils/constants";
import moment from "moment";
import { Network } from "zilswap-sdk/lib/constants";
import { ConnectedWallet, WalletAccountInfo, WalletConnectType } from "./ConnectedWallet";

export interface PrivateKeyConnectProps {
  network?: Network;
  timestamp?: moment.Moment;
};
export class PrivateKeyConnectedWallet implements ConnectedWallet {
  type = WalletConnectType.PrivateKey;

  network: Network;

  timestamp: moment.Moment;
  addressInfo: WalletAccountInfo;

  constructor(account: Account, props: PrivateKeyConnectProps = {}) {
    this.network = props.network || DefaultFallbackNetwork;
    this.timestamp = props.timestamp || moment();
    this.addressInfo = {
      bech32: account.bech32Address,
      byte20: account.address,
      privateKey: account.privateKey,
    };
  }
}
