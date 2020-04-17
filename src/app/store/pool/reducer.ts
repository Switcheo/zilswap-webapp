import { TYPES } from "./actions";
import { PoolFormState } from "./types";

const initial_state: PoolFormState = {
  values: {
    deposit: 0,
    depositCurrency: "ZIL",
    deposit1: 0,
    deposit1Currency: null,
    withdraw: 0,
    withdrawCurrency: null,
    type: "remove"
  },
  errors: {
    deposit: false,
    depositCurrency: false,
    withdraw: false,
    withdrawCurrency: false,
  },
  touched: {
    deposit: false,
    depositCurrency: false,
    withdraw: false,
    withdrawCurrency: false,
  }
}

const reducer = (state: PoolFormState = initial_state, action: any) => {
  const { values } = state;
  const { payload } = action;

  switch (action.type) {
    case TYPES.UPDATE:
      return { ...state, ...payload }
    case TYPES.UPDATE_EXTENDED:
      const { key, value } = payload;
      let output: PoolFormState = {
        ...state,
        values: {
          ...values,
          [key]: value
        }
      }
      switch (key) {
        default:
          break;
      }
      return output;
    default:
      return state;
  }
}

export default reducer;