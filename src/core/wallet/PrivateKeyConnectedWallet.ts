import { WalletConnectType, ConnectedWallet } from "./ConnectedWallet";
import moment from "moment";
import { getZilliqa, logout } from "core/zilliqa";
import { Account } from "@zilliqa-js/account";
import { listTransactions } from "core/services/viewblockService";
import BlockchainService from "core/blockchain";
import store, { actions } from "app/store";

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
    await this.getTransactions();
  }

  async getTransactions() {
    // @ts-ignore
    this.transactions = await listTransactions({ address: this.account.address });
  }

  async createTransaction() {
    const result = await BlockchainService.createTransaction({ toAddr: "zil1vg360alka6805ugu027j2mfnuf70ldm2xepu6g", amount: 1, gasPrice: 1000, gasLimit: 1 });
    return result;
  }

  logout() {
    logout();
    store.dispatch(actions.Wallet.logout());
  }
}