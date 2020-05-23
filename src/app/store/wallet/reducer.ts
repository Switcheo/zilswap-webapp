import { Types } from "./actions";
import { WalletState } from "./types";

const LOCAL_STORAGE_KEY_PRIVAYE_KEY = "zilswap:private-key";
const savedPk = localStorage.getItem(LOCAL_STORAGE_KEY_PRIVAYE_KEY) || undefined;

const initial_state: WalletState = {
  wallet: undefined,
  pk: savedPk,
};

const reducer = (state: WalletState = initial_state, action: any) => {
  switch (action.type) {
    case Types.WALLET_UPDATE:
      const { payload } = action;
      const { pk } = payload;
      if (pk) localStorage.setItem(LOCAL_STORAGE_KEY_PRIVAYE_KEY, pk);
      return { ...state, ...payload };

    case Types.WALLET_LOGOUT:
      localStorage.setItem(LOCAL_STORAGE_KEY_PRIVAYE_KEY, "");
      return { ...initial_state, pk: "" };
    default:
      return state;
  };
}

export default reducer;
