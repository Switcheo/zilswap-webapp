import { WalletState } from "./types";

const initial_state: WalletState = {
  wallet: undefined,
};

const reducer = (state: WalletState = initial_state, actions: any) => {
  switch (actions.type) {
    default:
      return state;
  };
}

export default reducer;
