import BigNumber from "bignumber.js";
import { SwapActionTypes } from "./actions";
import { SwapFormState } from "./types";
import { TokenActionTypes } from "../token/actions";
import { TokenUpdateProps } from "../token/types";

const initial_state: SwapFormState = {
  slippage: 0.005, // percent
  expiry: 15, // minutes

  percentage: new BigNumber(0.005),
  exactOf: "in",
  inAmount: new BigNumber(0),
  outAmount: new BigNumber(0),
  
  isInsufficientReserves: false,
}

const reducer = (state: SwapFormState = initial_state, action: any) => {
  const { payload } = action;

  switch (action.type) {
    case SwapActionTypes.UPDATE:
      return { ...state, ...payload };

    case TokenActionTypes.TOKEN_UPDATE:
      const updateProps: TokenUpdateProps = payload;
      if (updateProps.address !== state.inToken?.address &&
        updateProps.address !== state.outToken?.address)
        return state;

      return {
        ...state,
        ...updateProps.address === state.inToken?.address && {
          inToken: {
            ...state.inToken,
            ...updateProps,
          }
        },

        ...updateProps.address === state.outToken?.address && {
          outToken: {
            ...state.outToken,
            ...updateProps,
          }
        },
      };

    default:
      return state;
  }
}

export default reducer;