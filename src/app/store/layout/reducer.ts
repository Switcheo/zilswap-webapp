import { TYPES } from "./actions";
import { LayoutState } from "./types";

const initial_state: LayoutState = {
  showConnectWallet: false,
};

const reducer = (state: LayoutState = initial_state, actions: any) => {
  switch (actions.type) {
    case TYPES.TOGGLE_CONNECT_WALLET:
      return {
        ...state,
        showConnectWallet: !actions.override ? !state.showConnectWallet : actions.override === "open",
      };
    default:
      return state;
  };
}

export default reducer;
