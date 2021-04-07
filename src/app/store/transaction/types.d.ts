import { ObservedTx, TxReceipt, TxStatus } from "zilswap-sdk";
import { Network } from "zilswap-sdk/lib/constants";

export type WalletObservedTx = {
  network: Network;
  address: string;
} & ObservedTx;

export type Transaction = {
  hash: string;
  status: "pending" | TxStatus;
  observedTx?: WalletObservedTx;
  txReceipt?: TxReceipt;
};
export type SubmittedTx = {
  hash: string;
  status: "pending" | TxStatus;
};

export interface TransactionState {
  transactions: Transaction[];
  observingTxs: WalletObservedTx[];
  submittedTxs: SubmittedTx[];
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
  observedTx: WalletObservedTx,
};

export interface TransactionRemoveProps {
  hash: string;
};
