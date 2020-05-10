import { WalletConnectType, ConnectedWallet } from "./ConnectedWallet";
import moment from "moment";
import { getZilliqa } from "core/zilliqa";
import { Account } from "@zilliqa-js/account";
import { listTransactions } from "core/services/TransactionSrv";

export class MoonletConnectedWallet implements ConnectedWallet {
  type = WalletConnectType.Moonlet;

  account: Account;
  balance: string;
  timestamp: moment.Moment;
  moonlet: any;
  transactions: Array<any>;

  constructor(account: Account, balance: string, timestamp: moment.Moment, moonlet: any, transactions: Array<any>) {
    this.account = account;
    this.balance = balance;
    this.timestamp = timestamp;
    this.moonlet = moonlet;
    this.transactions = transactions;
  }

  async reload() {
    const zilliqa = getZilliqa();
    if (!zilliqa) return;
    const balanceResult = await zilliqa.blockchain.getBalance(this.account.address);
    this.balance = balanceResult.result.balance;
    this.timestamp = moment();
    await this.getTransaction();
  }

  async getTransaction() {
    // @ts-ignore
    this.transactions = listTransactions(this.account.address);
  }
}