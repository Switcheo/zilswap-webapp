import { WalletConnectType, ConnectedWallet } from "./ConnectedWallet";
import moment from "moment";
import { getZilliqa } from "core/zilliqa";
import { Account } from "@zilliqa-js/account";
import { listTransactions } from "core/services/TransactionSrv";

export class PrivateKeyConnectedWallet implements ConnectedWallet {
  type = WalletConnectType.PrivateKey;

  account: Account;
  balance: string;
  timestamp: moment.Moment;
  transactions: any;

  constructor(account: Account, balance: string, timestamp: moment.Moment, transactions: any) {
    this.account = account;
    this.balance = balance;
    this.timestamp = timestamp;
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
    this.transactions = await listTransactions({ address: this.account.address });
  }
}