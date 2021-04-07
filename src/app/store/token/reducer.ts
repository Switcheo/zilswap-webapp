import { BIG_ZERO } from "app/utils/constants";
import { TokenActionTypes } from "./actions";
import { TokenAddProps, TokenInitProps, TokenState, TokenUpdateProps, TokenUSDValues, UpdatePriceProps, UpdateUSDValuesProps } from "./types";

const initial_state: TokenState = {
  initialized: false,
  prices: {},
  tokens: {},
  values: {},
};

export const EMPTY_USD_VALUE: TokenUSDValues = {
  balance: BIG_ZERO,
  poolLiquidity: BIG_ZERO,
  zapRewards: BIG_ZERO,
}

const reducer = (state: TokenState = initial_state, action: any) => {
  const { payload } = action;

  switch (action.type) {

    case TokenActionTypes.TOKEN_INIT:
      const initProps: TokenInitProps = payload;
      return {
        ...state,
        initialized: true,
        tokens: {
          ...initProps.tokens,
        },
      };

    case TokenActionTypes.TOKEN_UPDATE:
      const updateProps: TokenUpdateProps = payload;
      return {
        ...state,
        tokens: {
          ...state.tokens,
          [updateProps.address]: {
            // copy original token properties
            ...state.tokens[updateProps.address] && {
              ...state.tokens[updateProps.address],
            },

            // copy new token properties
            ...updateProps,
          }
        }
      };

    case TokenActionTypes.TOKEN_UPDATE_VALUES:
      const usdValueProps: UpdateUSDValuesProps = payload;
      return {
        ...state,
        values: {
          ...state.values,
          ...usdValueProps,
        },
      };

    case TokenActionTypes.TOKEN_ADD:
      const addProps: TokenAddProps = payload;
      return {
        ...state,
        tokens: {
          ...state.tokens,
          [addProps.token.address]: addProps.token,
        }
      };

    case TokenActionTypes.TOKEN_UPDATE_PRICES:
      const updatePricesProps: UpdatePriceProps = payload;
      return {
        ...state,
        prices: updatePricesProps,
      };

    default:
      return state;
  };
}

export default reducer;
