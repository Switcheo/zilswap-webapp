import { TokenInfo } from "app/store/types";
import BigNumber from "bignumber.js";
import { BIG_ZERO } from "./constants";

export const valueCalculators = {
  pool: (prices: { [index: string]: BigNumber }, token: TokenInfo) => {
    const tokenPrice = prices[token.symbol] ?? BIG_ZERO;
    const zilPrice = prices.ZIL ?? BIG_ZERO;

    const totalTokenValue = token.pool?.tokenReserve.shiftedBy(-token.decimals).times(tokenPrice) ?? BIG_ZERO;
    const totalZilValue = token.pool?.zilReserve.shiftedBy(-12).times(zilPrice) ?? BIG_ZERO;

    return totalTokenValue.plus(totalZilValue);
  },

  amount: (prices: { [index: string]: BigNumber }, token: TokenInfo, amount: BigNumber) => {
    if (!token) return BIG_ZERO;
    const tokenPrice = prices[token.symbol] ?? BIG_ZERO;
    const tokenValue = amount.shiftedBy(-token.decimals).times(tokenPrice) ?? BIG_ZERO;
    return tokenValue;
  },
};

const useValueCalculators = () => {
  return valueCalculators;
};

export default useValueCalculators;
