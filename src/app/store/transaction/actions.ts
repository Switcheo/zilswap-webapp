import { TransactionUpdateProps, ObserveTxProps, TransactionsInitProps, TransactionRemoveProps } from "./types";

export const Types = {
  TX_UPDATE: "TX_UPDATE",
  TX_INIT: "TX_INIT",
  TX_OBSERVE: "TX_OBSERVE",
  TX_REMOVE: "TX_REMOVE",
};

export function init(payload: TransactionsInitProps) {
  return {
    type: Types.TX_INIT,
    payload
  }
};
export function update(payload: TransactionUpdateProps) {
  return {
    type: Types.TX_UPDATE,
    payload
  }
};
export function observe(payload: ObserveTxProps) {
  return {
    type: Types.TX_OBSERVE,
    payload
  }
};
export function remove(payload: TransactionRemoveProps) {
  return {
    type: Types.TX_REMOVE,
    payload
  }
};