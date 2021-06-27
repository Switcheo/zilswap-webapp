import BigNumber from "bignumber.js";
import { BridgeActionTypes } from "./actions";
import { BridgeState } from "./types";

const initial_state: BridgeState = {
  bridgeTxs: [],
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
