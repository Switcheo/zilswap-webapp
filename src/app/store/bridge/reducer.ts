import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { Blockchain } from "carbon-js-sdk";
import { Network } from "zilswap-sdk/lib/constants";
import { logger } from "core/utilities";
import { DataCoder, bnOrZero } from "app/utils";
import { LocalStorageKeys } from "app/utils/constants";
import { SimpleMap } from "app/utils";
import { BridgeActionTypes } from "./actions";
import { BridgeState, BridgeTx, BridgeableTokenMapping, BridgeableChains, UpdateBridgeBalance } from "./types";

export const BridgeTxEncoder: DataCoder<BridgeTx> = {
  encode: (tx: BridgeTx): object => {
    return {
      srcChain: tx.srcChain,
      dstChain: tx.dstChain,
      network: tx.network,
      srcAddr: tx.srcAddr,
      dstAddr: tx.dstAddr,
      srcToken: tx.srcToken,
      srcTokenId: tx.srcTokenId,
      dstToken: tx.dstToken,
      dstTokenId: tx.dstTokenId,
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
      depositConfirmations: tx.depositConfirmations,
    };
  },

  decode: (data: any): BridgeTx => {
    const object = data;
    return {
      srcChain: object.srcChain,
      dstChain: object.dstChain,
      network: object.network ?? Network.TestNet,
      srcAddr: object.srcAddr,
      dstAddr: object.dstAddr,
      srcToken: object.srcToken,
      srcTokenId: object.srcTokenId ?? "",
      dstToken: object.dstToken,
      dstTokenId: object.dstTokenId ?? "",
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
      depositConfirmations: object.depositConfirmations,
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
  previewBridgeTx: undefined,

  tokens: [],

  formState: {
    transferAmount: new BigNumber(0),
    fromBlockchain: Blockchain.Ethereum,
    toBlockchain: Blockchain.Zilliqa,

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

        const fromBlockchain = state.formState.fromBlockchain as BridgeableChains;
        const firstToken = tokens.find(token => token.blockchain === fromBlockchain);
        token = tokens?.find(bridgeToken => bridgeToken.denom.startsWith("zil") && bridgeToken.blockchain === fromBlockchain) ?? firstToken;

        state.formState = {
          ...state.formState,
          token,
        };
      }

      return {
        ...state,
        tokens: payload,
      };

      case BridgeActionTypes.UPDATE_TOKEN_BALANCES:
        const updateBalanceProps: UpdateBridgeBalance[] = payload;
        const newTokensState: BridgeableTokenMapping = state.tokens.slice()
        updateBalanceProps.forEach(k => {
          const index = state.tokens.findIndex(token => token.blockchain === k.chain && token.tokenAddress === k.tokenAddress)
          if (index > 0) {
            newTokensState[index].balance = k.balance
          }
        })
        return {
          ...state,
          tokens: newTokensState,
        };

    case BridgeActionTypes.ADD_BRIDGE_TXS:
      const uniqueTxs: SimpleMap<BridgeTx> = {};

      // reconstruct txs to force component re-render.
      const newTxs: BridgeTx[] = payload.map((tx: BridgeTx) => ({ ...tx }));
      for (const tx of [...state.bridgeTxs, ...newTxs]) {
        const sourceTxHash = tx.sourceTxHash!
        uniqueTxs[sourceTxHash] = {
          ...state.bridgeTxs.find(tx => tx.sourceTxHash === sourceTxHash),
          ...tx,
        };
      }

      const newBridgeTxs = Object.values(uniqueTxs);
      saveBridgeTxs(newBridgeTxs);

      const activeBridgeTx = findActiveBridgeTx(newBridgeTxs);
      return {
        ...state,
        activeBridgeTx,
        bridgeTxs: newBridgeTxs,
      };

    case BridgeActionTypes.SET_PREVIEW_BRIDGE_TX:
      const previewBridgeTx = action.payload;
      return {
        ...state,
        previewBridgeTx,
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
