import { PoolActionTypes } from "./actions";
import { PoolFormState } from "./types";
import Decimal from "decimal.js";
import store from "../index";

const initial_state: PoolFormState = {
  values: {
    deposit: 0,
    depositCurrency: "ZIL",
    deposit1: 0,
    deposit1Currency: null,
    withdraw: 0,
    withdrawCurrency: null,
    type: "add"
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
  const { deposit, deposit1, depositCurrency, deposit1Currency } = values;
  const { payload } = action;

  switch (action.type) {
    case PoolActionTypes.UPDATE:
      return { ...state, ...payload }
    case PoolActionTypes.UPDATE_EXTENDED:
      const { key, value, exchangeRate } = payload;
      let output: PoolFormState = {
        ...state,
        values: {
          ...values,
          [key]: value
        }
      }
      switch (key) {
        case "deposit":
          output.values.deposit1 = +(new Decimal(output.values.deposit || 0).times(new Decimal(exchangeRate || 0)).toFixed(10))
          break;
        case "deposit1":
          output.values.deposit = +(new Decimal(output.values.deposit1 || 0).dividedBy(new Decimal(exchangeRate || 0)).toFixed(10))
          break;
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