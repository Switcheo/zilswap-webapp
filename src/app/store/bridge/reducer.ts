import { SimpleMap } from "app/utils";
import { LocalStorageKeys } from "app/utils/constants";
import { bnOrZero, DataCoder } from "app/utils/strings/strings";
import BigNumber from "bignumber.js";
import { logger } from "core/utilities";
import dayjs from "dayjs";
import { Blockchain } from "tradehub-api-js";
import { BridgeActionTypes } from "./actions";
import { BridgeableTokenMapping, BridgeState, BridgeTx } from "./types";

export const BridgeTxEncoder: DataCoder<BridgeTx> = {
  encode: (tx: BridgeTx): object => {
    return {
      srcChain: tx.srcChain,
      dstChain: tx.dstChain,
      srcAddr: tx.srcAddr,
      dstAddr: tx.dstAddr,
      srcToken: tx.srcToken,
      dstToken: tx.dstToken,
      withdrawFee: tx.withdrawFee.toString(10),
      inputAmount: tx.inputAmount.toString(10),
      interimAddrMnemonics: tx.interimAddrMnemonics,
      approveTxHash: tx.approveTxHash,
      sourceTxHash: tx.sourceTxHash,
      depositTxConfirmedAt: DataCoder.encodeDayjs(tx.depositTxConfirmedAt),
      withdrawTxHash: tx.withdrawTxHash,
      destinationTxHash: tx.destinationTxHash,
      destinationTxConfirmedAt: DataCoder.encodeDayjs(tx.destinationTxConfirmedAt),
      dismissedAt: DataCoder.encodeDayjs(tx.dismissedAt),
      depositFailedAt: DataCoder.encodeDayjs(tx.depositFailedAt),
      depositDispatchedAt: DataCoder.encodeDayjs(tx.depositDispatchedAt),
    };
  },

  decode: (data: any): BridgeTx => {
    const object = data;
    return {
      srcChain: object.srcChain,
      dstChain: object.dstChain,
      srcAddr: object.srcAddr,
      dstAddr: object.dstAddr,
      srcToken: object.srcToken,
      dstToken: object.dstToken,
      withdrawFee: bnOrZero(object.withdrawFee),
      inputAmount: bnOrZero(object.inputAmount),
      interimAddrMnemonics: object.interimAddrMnemonics,
      approveTxHash: object.approveTxHash,
      sourceTxHash: object.sourceTxHash,
      depositTxConfirmedAt: DataCoder.decodeDayjs(object.depositTxConfirmedAt),
      withdrawTxHash: object.withdrawTxHash,
      destinationTxHash: object.destinationTxHash,
      destinationTxConfirmedAt: DataCoder.decodeDayjs(object.destinationTxConfirmedAt),
      dismissedAt: DataCoder.decodeDayjs(object.dismissedAt),
      depositFailedAt: DataCoder.decodeDayjs(object.depositFailedAt),
      depositDispatchedAt: DataCoder.decodeDayjs(object.depositDispatchedAt),
    }
  }
}

const findActiveBridgeTx = (bridgeTxs: BridgeTx[]) => {
  return bridgeTxs.find(bridgeTx => !bridgeTx.dismissedAt)
}

const loadedBridgeTxsData = localStorage.getItem(LocalStorageKeys.BridgeTxs);
let loadedBridgeTxs: BridgeTx[] = [];
try {
  if (loadedBridgeTxsData) {
    const savedTxs: object[] = JSON.parse(loadedBridgeTxsData);
    loadedBridgeTxs = savedTxs.map(BridgeTxEncoder.decode);
    logger("loadedBridgeTxs", loadedBridgeTxs);
  }
} catch (error) {
  console.error(error);
  loadedBridgeTxs = [];
}

const saveBridgeTxs = (txs: BridgeTx[]) => {
  const encodedTxs = txs.map(BridgeTxEncoder.encode);
  logger("saveBridgeTxs", encodedTxs);
  localStorage.setItem(LocalStorageKeys.BridgeTxs, JSON.stringify(encodedTxs));
}

const initial_state: BridgeState = {
  bridgeTxs: loadedBridgeTxs,
  activeBridgeTx: findActiveBridgeTx(loadedBridgeTxs),

  tokens: {
    [Blockchain.Zilliqa]: [],
    [Blockchain.Ethereum]: [],
  },

  formState: {
    transferAmount: new BigNumber(0),
    fromBlockchain: Blockchain.Zilliqa,
    toBlockchain: Blockchain.Ethereum,

    isInsufficientReserves: false,
    forNetwork: null,
  }
}

const reducer = (state: BridgeState = initial_state, action: any) => {
  const { payload } = action;

  switch (action.type) {

    case BridgeActionTypes.DISMISS_TX: {

      const txIndex = state.bridgeTxs.findIndex(tx => action.payload.sourceTxHash === tx.sourceTxHash);
      if (txIndex < 0)
        return state;

      state.bridgeTxs.splice(txIndex, 1, {
        ...action.payload,
        dismissedAt: dayjs(),
      });
      saveBridgeTxs(state.bridgeTxs);
      const activeBridgeTx = findActiveBridgeTx(state.bridgeTxs);

      return {
        ...state,
        activeBridgeTx,
        bridgeTxs: [...state.bridgeTxs],
      };
    };

    case BridgeActionTypes.SET_TOKENS:
      const tokens: BridgeableTokenMapping = payload;
      let token = state.formState.token;
      if (!token) {

        const fromBlockchain = state.formState.fromBlockchain as Blockchain.Zilliqa | Blockchain.Ethereum;
        const firstToken = tokens[fromBlockchain]?.[0];
        token = tokens[fromBlockchain]?.find(bridgeToken => bridgeToken.denom.startsWith("zil")) ?? firstToken;

        state.formState = {
          ...state.formState,
          token,
        };
      }

      return {
        ...state,
        tokens: payload,
      };

    case BridgeActionTypes.ADD_BRIDGE_TXS:
      const uniqueTxs: SimpleMap<BridgeTx> = {};

      // reconstruct txs to force component re-render.
      const newTxs: BridgeTx[] = payload.map((tx: BridgeTx) => ({ ...tx }));
      for (const tx of [...state.bridgeTxs, ...newTxs]) {
        uniqueTxs[tx.sourceTxHash!] = tx;
      }

      const newBridgeTxs = Object.values(uniqueTxs);
      saveBridgeTxs(newBridgeTxs);

      const activeBridgeTx = findActiveBridgeTx(newBridgeTxs);
      return {
        ...state,
        activeBridgeTx,
        bridgeTxs: newBridgeTxs,
      };

    case BridgeActionTypes.UPDATE_FORM:
      return {
        ...state,
        formState: {
          ...state.formState,
          ...payload,
        }
      };

    case BridgeActionTypes.UPDATE_FEE:
      return {
        ...state,
        formState: {
          ...state.formState,
          withdrawFee: payload,
        }
      };

    default:
      return state;
  }
}

export default reducer;
