import { ConnectedWallet } from "core/wallet/wallet";
import { BigNumber } from "bignumber.js";
import { ObservedTx, TxReceipt, TxStatus } from "zilswap-sdk";

export type Transaction = {
  hash: string;
  status: "pending" | TxStatus;
  observedTx?: ObservedTx;
  txReceipt?: TxReceipt;
};

export interface TransactionState {
  transactions: Transaction[];
  observingTxs: ObservedTx[];
  confirmedTxs: ObservedTx[];
};

export interface TransactionsInitProps {
  transactions: Transaction[],
};
export interface TransactionUpdateProps {
  hash: string;
  status: TxStatus;
  txReceipt?: TxReceipt;
};

export interface ObserveTxProps {
  observedTx: ObservedTx,
};

export interface TransactionRemoveProps {
  hash: string;
};