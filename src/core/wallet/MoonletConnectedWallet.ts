import { WalletConnectType, ConnectedWallet } from "./ConnectedWallet";
import moment from "moment";
import { zilliqa } from "core/zilliqa";
import { Account } from "@zilliqa-js/account";

export class MoonletConnectedWallet implements ConnectedWallet {
    type = WalletConnectType.Moonlet;
  
    account: Account;
    balance: string;
    timestamp: moment.Moment;
  
    constructor(account: Account, balance: string, timestamp: moment.Moment) {
      this.account = account;
      this.balance = balance;
      this.timestamp = timestamp;
    }
  
    async reload() {
      const balanceResult = await zilliqa.blockchain.getBalance(this.account.address);
      this.balance = balanceResult.result.balance;
      this.timestamp = moment();
    }
  }