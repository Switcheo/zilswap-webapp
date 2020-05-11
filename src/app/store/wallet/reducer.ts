import { WalletState, WalletCurrencies } from "./types";
import { WalletActionTypes } from "./actions";

const LOCAL_STORAGE_KEY_PRIVAYE_KEY = "zilswap:pk";
const savedPk = localStorage.getItem(LOCAL_STORAGE_KEY_PRIVAYE_KEY);

const initial_currencies: WalletCurrencies = {}

const initial_state: WalletState = {
  wallet: undefined,
  currencies: initial_currencies,
  pk: savedPk || ""
};

const reducer = (state: WalletState = initial_state, action: any) => {
  switch (action.type) {
    case WalletActionTypes.UPDATE:
      const { payload } = action;
      const { pk } = payload;
      if (pk) localStorage.setItem(LOCAL_STORAGE_KEY_PRIVAYE_KEY, pk);
      return { ...state, ...payload };
    default:
      return state;
  };
}

export default reducer;
