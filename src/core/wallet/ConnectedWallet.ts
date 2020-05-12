import moment from "moment";
import { Transaction } from "@zilliqa-js/account";


export type ConnectOptionType = "moonlet" | "privateKey";

export enum WalletConnectType {
  Moonlet, PrivateKey
}

export type ConnectedWallet = {
  type: WalletConnectType;
  balance: string;
  timestamp: moment.Moment;
  transactions: Array<any>;
  reload: () => Promise<void>;
  getTransactions: () => Promise<void>;
  createTransaction: () => Promise<Transaction>;
  logout: () => void;
}

export type ConnectWalletResult = {
  wallet?: ConnectedWallet;
  error?: any;
} | null;
