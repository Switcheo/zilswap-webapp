import { WalletState } from "./types";
import { TYPES } from "./actions";

const initial_state: WalletState = {
  connectedWallet: undefined,
};

const reducer = (state: WalletState = initial_state, actions: any) => {
  switch (actions.type) {
    case TYPES.UPDATE_WALLET:
      return {
        ...state,
        connectedWallet: actions.payload
      }
    default:
      return state;
  };
}

export default reducer;
