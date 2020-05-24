import { Types } from "./actions";
import { TokenState, TokenUpdateProps, TokenInitProps } from "./types";

const initial_state: TokenState = {
  initialized: false,
  tokens: {},
};

const reducer = (state: TokenState = initial_state, action: any) => {
  const { payload } = action;

  switch (action.type) {

    case Types.TOKEN_UPDATE:
      const updateProps: TokenUpdateProps = payload;
      return {
        ...state,
        tokens: {
          ...state.tokens,
          [updateProps.address]: {
            ...updateProps,
          }
        }
      };

    case Types.TOKEN_INIT:
      const initProps: TokenInitProps = payload;
      return {
        ...state,
        initialized: true,
        tokens: {
          ...initProps.tokens,
        }
      };
    default:
      return state;
  };
}

export default reducer;
