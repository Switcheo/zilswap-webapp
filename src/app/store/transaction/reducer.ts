import { Types } from "./actions";
import { Types as WalletTypes } from "../wallet/actions";
import { ObserveTxProps, Transaction, TransactionsInitProps, TransactionState, TransactionUpdateProps, TransactionRemoveProps } from "./types";
import { ObservedTx } from "zilswap-sdk";


const LOCAL_STORAGE_KEY_OBSERVING_TXS = "zilswap:observing-txs";
const savedTxsString = localStorage.getItem(LOCAL_STORAGE_KEY_OBSERVING_TXS) || "[]";
const savedObservingTxs = JSON.parse(savedTxsString);

const initial_state: TransactionState = {
  transactions: [],
  confirmedTxs: [],
  observingTxs: savedObservingTxs,
};

const reducer = (state: TransactionState = initial_state, action: any) => {
  switch (action.type) {
    case Types.TX_INIT:
      const initProps: TransactionsInitProps = action.payload;
      const interimConfirmedTxs: ObservedTx[] = [];
      const observingTxs: ObservedTx[] = [];
      state.observingTxs.forEach(observingTx => {
        if (initProps.transactions.find(tx => tx.hash === observingTx.hash))
          interimConfirmedTxs.push(observingTx);
        else
          observingTxs.push(observingTx);
      })
      return {
        transactions: [...initProps.transactions],
        observingTxs,
        confirmedTxs: interimConfirmedTxs,
      };
    case Types.TX_OBSERVE:
      const observeProps: ObserveTxProps = action.payload;
      const newPendingTx: Transaction = {
        status: "pending",
        hash: observeProps.observedTx.hash,
        observedTx: observeProps.observedTx,
      };
      return {
        ...state,
        transactions: [
          ...state.transactions,
          newPendingTx,
        ],
        observingTxs: [
          ...state.observingTxs,
          observeProps.observedTx,
        ],
      };
    case Types.TX_UPDATE:
      const updateProps: TransactionUpdateProps = action.payload;
      const updateTxIndex = state.transactions.findIndex(tx => tx.hash === updateProps.hash);
      if (updateTxIndex >= 0) {
        state.transactions.splice(updateTxIndex, 1, { ...updateProps });
      }
      const observedTxIndex = state.observingTxs.findIndex(tx => tx.hash === updateProps.hash);
      const confirmedTxs = state.observingTxs.splice(observedTxIndex, 1);
      return {
        transactions: [...state.transactions],
        observingTxs: [...state.observingTxs],
        confirmedTxs: [...state.confirmedTxs, ...confirmedTxs],
      };
    case Types.TX_REMOVE:
      const removeProps: TransactionRemoveProps = action.payload;
      return {
        ...state,
        confirmedTxs: state.confirmedTxs.filter(tx => tx.hash !== removeProps.hash),
      };
    case WalletTypes.WALLET_LOGOUT:
      return {
        transactions: [],
        observingTxs: [],
        confirmedTxs: [],
      };
    default:
      return state;
  };
}

const wrapper = (state: TransactionState, action: any) => {
  const newState = reducer(state, action);
  localStorage.setItem(LOCAL_STORAGE_KEY_OBSERVING_TXS, JSON.stringify(newState.observingTxs));

  return newState;
};

export default wrapper;
