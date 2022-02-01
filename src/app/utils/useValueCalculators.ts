import BigNumber from "bignumber.js";
import { TokenInfo, TokenState } from "app/store/types";
import { BIG_ZERO, ZIL_ADDRESS } from "./constants";
import { tryGetBech32Address } from "./strings";

export const valueCalculators = {
  pool: (prices: { [index: string]: BigNumber }, token: TokenInfo) => {
    const tokenPrice = prices[token.address] ?? BIG_ZERO;
    const zilPrice = prices[ZIL_ADDRESS] ?? BIG_ZERO;

    const totalTokenValue = token.pool?.tokenReserve.shiftedBy(-token.decimals).times(tokenPrice) ?? BIG_ZERO;
    const totalZilValue = token.pool?.zilReserve.shiftedBy(-12).times(zilPrice) ?? BIG_ZERO;

    return totalTokenValue.plus(totalZilValue);
  },

  amount: (prices: { [index: string]: BigNumber }, token: TokenInfo, amount: BigNumber) => {
    if (!token) return BIG_ZERO;
    const tokenPrice = prices[token.address] ?? BIG_ZERO;
    const tokenValue = amount.shiftedBy(-token.decimals).times(tokenPrice) ?? BIG_ZERO;
    return tokenValue;
  },

  usd: (tokenState: TokenState, bech32Address: string, rawAmount: string) => {
    const token = tokenState.tokens[tryGetBech32Address(bech32Address) ?? ""]
    if (!token) return BIG_ZERO
    return valueCalculators.amount(tokenState.prices, token, new BigNumber(rawAmount))
  }
};

const useValueCalculators = () => {
  return valueCalculators;
};

export default useValueCalculators;
