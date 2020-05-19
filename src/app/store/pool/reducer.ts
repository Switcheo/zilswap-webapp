import { PoolActionTypes } from "./actions";
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
  },
  poolValues: {
    contributionPercentage: null,
    exchangeRate: null,
    tokenReserve: null,
    totalContribution: null,
    userContribution: null,
    zilReserve: null,
  }
}

const reducer = (state: PoolFormState = initial_state, action: any) => {
  const { values } = state;
  const { payload } = action;

  switch (action.type) {
    case PoolActionTypes.UPDATE:
      return { ...state, ...payload }
    case PoolActionTypes.UPDATE_EXTENDED:
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
    case PoolActionTypes.UPDATE_POOL:
      return { ...state, poolValues: { ...payload } };
    default:
      return state;
  }
}

export default reducer;