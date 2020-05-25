import { SwapFormState } from "./types";
import { SwapActionTypes } from "./actions";
import { BIG_ONE } from "app/utils/contants";
import BigNumber from "bignumber.js";

const initial_state: SwapFormState = {
  slippage: 0.005, // percent
  expiry: 15, // minutes

  percentage: new BigNumber(0.005),
  exactOf: "in",
  inAmount: new BigNumber(0),
  outAmount: new BigNumber(0),
  exchangeRate: BIG_ONE,
}

const reducer = (state: SwapFormState = initial_state, action: any) => {
  const { payload } = action;

  switch (action.type) {
    case SwapActionTypes.UPDATE:
      return { ...state, ...payload };
    default:
      return state;
  }
}

export default reducer;