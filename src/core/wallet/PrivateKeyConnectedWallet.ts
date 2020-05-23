import { Account } from "@zilliqa-js/account";
import { BN } from "@zilliqa-js/util";
import moment from "moment";
import { Network } from "zilswap-sdk/lib/constants";
import { ConnectedWallet, WalletAccountInfo, WalletConnectType } from "./ConnectedWallet";

export interface PrivateKeyConnectProps {
  network?: Network;
  timestamp?: moment.Moment;
  balance?: BN;
};
export class PrivateKeyConnectedWallet implements ConnectedWallet {
  type = WalletConnectType.PrivateKey;

  network: Network;

  balance: BN;
  timestamp: moment.Moment;
  addressInfo: WalletAccountInfo;

  constructor(account: Account, props: PrivateKeyConnectProps = {}) {
    this.network = props.network || Network.TestNet;
    this.timestamp = props.timestamp || moment();
    this.balance = props.balance || new BN(0);
    this.addressInfo = {
      bech32: account.bech32Address,
      byte20: account.address,
      privateKey: account.privateKey,
    };
  }
}