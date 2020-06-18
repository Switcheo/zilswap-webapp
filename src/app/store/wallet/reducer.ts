import { Types } from "./actions";
import { WalletState } from "./types";

const LOCAL_STORAGE_KEY_PRIVATE_KEY = "zilswap:private-key";
const LOCAL_STORAGE_KEY_ZILPAY = "zilswap:zilpay-connected";
const savedPk = localStorage.getItem(LOCAL_STORAGE_KEY_PRIVATE_KEY) || undefined;
const savedZilpay = localStorage.getItem(LOCAL_STORAGE_KEY_ZILPAY) || undefined;

const initial_state: WalletState = {
  wallet: undefined,
  pk: savedPk,
  zilpay: savedZilpay !== undefined,
};

const reducer = (state: WalletState = initial_state, action: any) => {
  switch (action.type) {
    case Types.WALLET_UPDATE:
      const { payload } = action;
      const { pk, zilpay } = payload;
      if (pk) localStorage.setItem(LOCAL_STORAGE_KEY_PRIVATE_KEY, pk);
      if (zilpay) localStorage.setItem(LOCAL_STORAGE_KEY_ZILPAY, "true");
      return { ...state, ...payload };

    case Types.WALLET_LOGOUT:
      localStorage.removeItem(LOCAL_STORAGE_KEY_PRIVATE_KEY);
      localStorage.removeItem(LOCAL_STORAGE_KEY_ZILPAY);
      return { ...initial_state, pk: "" };
    default:
      return state;
  };
}

export default reducer;
