import BigNumber from "bignumber.js";
import { Blockchain } from "tradehub-api-js";
import { BridgeActionTypes } from "./actions";
import { BridgeState } from "./types";

const initial_state: BridgeState = {
  bridgeTxs: [],

  tokens: {
    [Blockchain.Zilliqa]: [
      {
        blockchain: Blockchain.Zilliqa,
        tokenAddress: '5d3ecead6149b264db1ffbc45625e0131ac06d3c',
        denom: 'usdt.z',
        toBlockchain: Blockchain.Ethereum,
        toTokenAddress: '1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        toDenom: 'usdt.e',
      }
    ],
    [Blockchain.Ethereum]: [
      {
        blockchain: Blockchain.Ethereum,
        tokenAddress: '1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        denom: 'usdt.e',
        toBlockchain: Blockchain.Zilliqa,
        toTokenAddress: '5d3ecead6149b264db1ffbc45625e0131ac06d3c',
        toDenom: 'usdt.z',
      }
    ],
  },

  formState: {
    transferAmount: new BigNumber(0),

    isInsufficientReserves: false,
    forNetwork: null,
  }
}

const reducer = (state: BridgeState = initial_state, action: any) => {
  const { payload } = action;

  switch (action.type) {

    case BridgeActionTypes.CLEAR_FORM:
      return {
        ...state,
        formState: {
          sourceAddress: '',
          transferAmount: new BigNumber(0),

          isInsufficientReserves: false,
          forNetwork: null,
        },
      };

    case BridgeActionTypes.UPDATE_FORM:
      return {
        ...state,
        formState: {
          ...state.formState,
          ...action.payload,
        }
      };

    case BridgeActionTypes.SET_TOKENS:
      return {
        ...state,
        formState: {
          ...state.formState,
          tokens: payload,
        },
      };

    case BridgeActionTypes.ADD_BRIDGE_TXS:
      return {
        ...state,
        bridgeTxs: [
          ...state.bridgeTxs,
          ...payload,
        ]
      };

    case BridgeActionTypes.UPDATE_FORM:
      return {
        ...state,
        formState: {
          ...state.formState,
          ...payload,
        }
      };

    default:
      return state;
  }
}

export default reducer;
