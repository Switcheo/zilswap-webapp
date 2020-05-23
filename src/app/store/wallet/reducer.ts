import { WalletActionTypes } from "./actions";
import { WalletCurrencies, WalletState } from "./types";

const LOCAL_STORAGE_KEY_PRIVAYE_KEY = "zilswap:pk";
const savedPk = localStorage.getItem(LOCAL_STORAGE_KEY_PRIVAYE_KEY);

const initial_currencies: WalletCurrencies = {}

const initial_state: WalletState = {
  wallet: undefined,
  currencies: initial_currencies,
  pk: savedPk || "",
};

const reducer = (state: WalletState = initial_state, action: any) => {
  switch (action.type) {
    case WalletActionTypes.UPDATE:
      const { payload } = action;
      const { pk } = payload;

      console.log("wallet update paylaod", { payload })
      if (pk) localStorage.setItem(LOCAL_STORAGE_KEY_PRIVAYE_KEY, pk);
      return { ...state, ...payload };

    case WalletActionTypes.UPDATE_CURRENCY:
      //@ts-ignore
      return {
        ...state,
        currencies: {
          ...state.currencies,
          [action.payload.currency]: {
            //@ts-ignore
            ...state.currencies[action.payload.currency],
            balance: action.payload.balance
          }
        }
      };

    case WalletActionTypes.UPDATE_CURRENCY_POOL:
      return {
        ...state,
        currencies: {
          ...state.currencies,
          [action.payload.currency]: {
            //@ts-ignore
            ...state.currencies[action.payload.currency],
            ...action.payload
          }
        }
      }

    case WalletActionTypes.LOGOUT:
      localStorage.setItem(LOCAL_STORAGE_KEY_PRIVAYE_KEY, "");
      return { ...initial_state, pk: "" };
    default:
      return state;
  };
}

export default reducer;
