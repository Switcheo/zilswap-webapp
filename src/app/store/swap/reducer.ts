import { SwapFormState } from "./types";
import { SwapActionTypes } from "./actions";
import Decimal from "decimal.js";

const initial_state: SwapFormState = {
  values: {
    give: 0,
    receive: 0,
    giveCurrency: "SWTH",
    receiveCurrency: "ZIL",
    rate: 29913.9683245177,
    slippage: 0,
    limitSlippage: 0.5,
    expire: 15
  },
  errors: {
    give: false,
    receive: false,
    giveCurrency: false,
    receiveCurrency: false,
    rate: false,
    slippage: false,
    limitSlippage: false,
    expire: false,
  },
  touched: {
    give: false,
    receive: false,
    giveCurrency: false,
    receiveCurrency: false,
    rate: false,
    slippage: false,
    limitSlippage: false,
    expire: false,
  }
}

const reducer = (state: SwapFormState = initial_state, action: any) => {
  const { values } = state;
  const { give, receive, receiveCurrency, giveCurrency, rate } = values;
  const { payload } = action;

  switch (action.type) {
    case SwapActionTypes.UPDATE:
      return { ...state, ...payload }
    case SwapActionTypes.REVERSE:
      return {
        ...state,
        values: {
          ...values,
          give: receive,
          receive: give,
          receiveCurrency: giveCurrency,
          giveCurrency: receiveCurrency,
          rate: +(new Decimal(1).dividedBy(new Decimal(rate)).toFixed(10)),
        }
      }
    case SwapActionTypes.UPDATE_EXTENDED:
      const { key, value } = payload;
      let output: SwapFormState = {
        ...state,
        values: {
          ...values,
          [key]: value
        }
      }
      switch (key) {
        case "give":
          output.values.receive = +(new Decimal(give || 0).times(new Decimal(rate || 0)).toFixed(10))
          break;
        case "receive":
          output.values.give = (new Decimal(receive || 0).dividedBy(new Decimal(rate || 1)).toFixed(10))
          break;
        case "giveCurrency":
        case "receiveCurrency":
        default:
          break;
      }
      return output;
    default:
      return state;
  }
}

export default reducer;