import { WalletConnectType, ConnectedWallet } from "./ConnectedWallet";
import moment from "moment";
import { getZilliqa } from "core/zilliqa";
import { Account } from "@zilliqa-js/account";

export class MoonletConnectedWallet implements ConnectedWallet {
  type = WalletConnectType.Moonlet;

  account: Account;
  balance: string;
  timestamp: moment.Moment;
  moonlet: any;

  constructor(account: Account, balance: string, timestamp: moment.Moment, moonlet: any) {
    this.account = account;
    this.balance = balance;
    this.timestamp = timestamp;
    this.moonlet = moonlet;
  }

  async reload() {
    const zilliqa = getZilliqa();
    if (!zilliqa) return;
    const balanceResult = await zilliqa.blockchain.getBalance(this.account.address);
    this.balance = balanceResult.result.balance;
    this.timestamp = moment();
  }

  async getTransaction() {

  }
}