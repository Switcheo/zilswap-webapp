import { BIG_ZERO } from "app/utils/constants";
import { TokenActionTypes } from "./actions";
import {
  TokenState, TokenAddProps, TokenInitProps,
  TokenUpdateProps, TokenUpdateAllProps,
  UpdatePriceProps, UpdateUSDValuesProps,
  TokenUSDValues, TokenInfo,
} from "./types";
import { LocalStorageKeys } from "app/utils/constants";

const savedTokenStrs = localStorage.getItem(LocalStorageKeys.UserTokenList) || "[]";
const savedTokens = JSON.parse(savedTokenStrs);


const initial_state: TokenState = {
  initialized: false,
  prices: {},
  tokens: {},
  values: {},
  userSavedTokens: savedTokens,
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

    case TokenActionTypes.TOKEN_UPDATE_ALL:
      const updateAllProps: TokenUpdateAllProps = payload;
      const newTokensState: { [index: string]: TokenInfo } = {}
      for (const k in state.tokens) {
        newTokensState[k] = { ...state.tokens[k] }
      }
      for (const k in updateAllProps) {
        newTokensState[k] = { ...newTokensState[k], ...updateAllProps[k] }
      }
      return {
        ...state,
        tokens: newTokensState,
      };

    case TokenActionTypes.TOKEN_UPDATE_USD:
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

    case TokenActionTypes.TOKEN_UPDATE_USER_SAVED:
      let newTokens = state.userSavedTokens;
      if (newTokens.indexOf(payload) >= 0) {
        newTokens.splice(newTokens.indexOf(payload), 1);
      } else {
        newTokens.push(payload);
      }

      const savedTokensData = JSON.stringify(newTokens);
      localStorage.setItem(LocalStorageKeys.UserTokenList, savedTokensData);
      return {
        ...state,
        userSavedTokens: newTokens,
      };


    default:
      return state;
  };
}

export default reducer;
