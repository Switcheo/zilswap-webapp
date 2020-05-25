import BigNumber from "bignumber.js";
import { TokenActionTypes } from "../token/actions";
import { TokenUpdateProps } from "../token/types";
import { PoolActionTypes } from "./actions";
import { PoolFormState, PoolSelectProps } from "./types";

const initial_state: PoolFormState = {
  token: null,

  addZilAmount: new BigNumber(0),
  addTokenAmount: new BigNumber(0),

  removeZilAmount: new BigNumber(0),
  removeTokenAmount: new BigNumber(0),
}

const reducer = (state: PoolFormState = initial_state, action: any) => {
  const { payload } = action;

  switch (action.type) {

    case PoolActionTypes.POOL_SELECT:
      const selectProps: PoolSelectProps = payload;
      return {
        ...state,
        token: selectProps.token,
      };

    case TokenActionTypes.TOKEN_UPDATE:
      const updateProps: TokenUpdateProps = payload;
      if (updateProps.address !== state.token?.address)
        return state;

      return {
        ...state,
        token: {
          ...state.token,
          ...updateProps,
        },
      };

    case PoolActionTypes.UPDATE:
      return { ...state, ...payload };

    default:
      return state;
  }
}

export default reducer;