import { TYPES } from "./actions";
import { LayoutState } from "./types";

const initial_state: LayoutState = {
  showWalletDialog: false,
};

const reducer = (state: LayoutState = initial_state, actions: any) => {
  switch (actions.type) {
    case TYPES.TOGGLE_SHOW_WALLET:
      return {
        ...state,
        showWalletDialog: !actions.override ? !state.showWalletDialog : actions.override === "open",
      };
    default:
      return state;
  };
}

export default reducer;
