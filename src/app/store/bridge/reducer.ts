import BigNumber from "bignumber.js";
import { BridgeActionTypes } from "./actions";
import { BridgeFormState } from "./types";
import { TokenActionTypes } from "../token/actions";
import { TokenUpdateProps, TokenUpdateAllProps } from "../token/types";

const initial_state: BridgeFormState = {
  transferAmount: new BigNumber(0),

  isInsufficientReserves: false,
  forNetwork: null,
}

const reducer = (state: BridgeFormState = initial_state, action: any) => {
  const { payload } = action;

  switch (action.type) {

    case BridgeActionTypes.CLEAR_FORM:
      return {
        sourceAddress: '',
        transferAmount: new BigNumber(0),

        isInsufficientReserves: false,
        forNetwork: null,
      };

    case BridgeActionTypes.UPDATE:
      return { ...state, ...payload };

    case TokenActionTypes.TOKEN_UPDATE:
      const updateProps: TokenUpdateProps = payload;
      if (updateProps.address !== state.token?.address)
        return state;

      return {
        ...state,
        ...updateProps.address === state.token?.address && {
          token: {
            ...state.token,
            ...updateProps,
          }
        }
      };

    default:
      return state;
  }
}

export default reducer;
