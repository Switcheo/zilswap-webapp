import { Types } from "./actions";
import { TokenState, TokenUpdateProps, TokenInitProps, TokenAddProps } from "./types";

const initial_state: TokenState = {
  initialized: false,
  tokens: {},
};

const reducer = (state: TokenState = initial_state, action: any) => {
  const { payload } = action;

  switch (action.type) {

    case Types.TOKEN_INIT:
      const initProps: TokenInitProps = payload;
      return {
        ...state,
        initialized: true,
        tokens: {
          ...initProps.tokens,
        }
      };

    case Types.TOKEN_UPDATE:
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

    case Types.TOKEN_ADD:
      const addProps: TokenAddProps = payload;
      return {
        ...state,
        tokens: {
          ...state.tokens,
          [addProps.token.address]: {
            ...addProps.token,
          }
        }
      };
    default:
      return state;
  };
}

export default reducer;
