import { DEFAULT_TX_EXPIRY, DEFAULT_TX_SLIPPAGE, LocalStorageKeys } from "app/utils/constants";
import BigNumber from "bignumber.js";
import { TokenActionTypes } from "../token/actions";
import { TokenUpdateAllProps, TokenUpdateProps } from "../token/types";
import { SwapActionTypes } from "./actions";
import { SwapFormState } from "./types";

const loadSavedSlippage = () => {
  try {
    const savedData = JSON.parse(localStorage.getItem(LocalStorageKeys.SwapSlippageExpiry) || "{}");
    const slippage = parseFloat(savedData.slippage ?? DEFAULT_TX_SLIPPAGE)
    const expiry = parseInt(savedData.expiry ?? DEFAULT_TX_EXPIRY)
    return {
      slippage: isNaN(slippage) ? DEFAULT_TX_SLIPPAGE : slippage,
      expiry: isNaN(expiry) ? DEFAULT_TX_EXPIRY : expiry,
    }
  } catch (error) {
    return {};
  }
}

const savedSlippageExpiry = loadSavedSlippage();

const initial_state: SwapFormState = {
  slippage: savedSlippageExpiry.slippage ?? DEFAULT_TX_SLIPPAGE, // percent
  expiry: savedSlippageExpiry.expiry ?? DEFAULT_TX_EXPIRY, // blocks

  exactOf: "in",
  inAmount: new BigNumber(0),
  outAmount: new BigNumber(0),

  isInsufficientReserves: false,
  forNetwork: null,
}

const checkToSaveSlippageExpiry = (state: SwapFormState, payload: any) => {
  if (payload.slippage !== undefined || payload.expiry !== undefined) {
    let toSave = { slippage: state.slippage, expiry: state.expiry, ...payload };
    localStorage.setItem(LocalStorageKeys.SwapSlippageExpiry, JSON.stringify(toSave));
  }
}

const reducer = (state: SwapFormState = initial_state, action: any) => {
  const { payload } = action;

  switch (action.type) {

    case SwapActionTypes.CLEAR_FORM:
      return {
        exactOf: "in",
        inAmount: new BigNumber(0),
        outAmount: new BigNumber(0),

        isInsufficientReserves: false,
        forNetwork: null,
      };

    case SwapActionTypes.UPDATE:
      checkToSaveSlippageExpiry(state, payload);
      return { ...state, ...payload };

    case TokenActionTypes.TOKEN_UPDATE_ALL:
      const updateAllProps: TokenUpdateAllProps = payload;
      const tokenIn = updateAllProps[state.inToken?.address || ""]
      const tokenOut = updateAllProps[state.outToken?.address || ""]

      return {
        ...state,
        ...(tokenIn && tokenIn.address === state.inToken?.address) && {
          inToken: {
            ...state.inToken,
            ...tokenIn,
          }
        },
        ...(tokenOut && tokenOut.address === state.outToken?.address) && {
          outToken: {
            ...state.outToken,
            ...tokenOut,
          }
        },
      };

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
