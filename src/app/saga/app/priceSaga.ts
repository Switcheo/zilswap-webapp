import actions from "app/store/actions";
import { RootState, TokenInfo } from "app/store/types";
import { BIG_ONE, PRICE_REFRESH_RATE, ZIL_TOKEN_NAME } from "app/utils/constants";
import BigNumber from "bignumber.js";
import { logger } from "core/utilities";
import { CoinGecko, CoinGeckoPriceResult } from "core/utilities/coingecko";
import { ZilswapConnector } from "core/zilswap";
import { call, delay, put, select } from "redux-saga/effects";

export default function* priceSaga() {
  logger("init price saga");
  const coinGeckoZilName = "zilliqa";
  const coinGeckoQuoteDenom = "usd";

  while (true) {
    logger("run price saga");
    try {
      const tokens = (yield select((state: RootState) => state.token.tokens)) as unknown as { [index: string]: TokenInfo };
      const zilToken = tokens[ZIL_TOKEN_NAME] as TokenInfo;
      if (!zilToken)
        continue;

      const result = (yield call(CoinGecko.getPrice, {
        coins: [coinGeckoZilName],
        quote: coinGeckoQuoteDenom,
      })) as CoinGeckoPriceResult | undefined;

      const zilPrice = result?.zilliqa;
      if (!zilPrice)
        continue;

      const prices = Object.values(tokens).reduce((accum, token) => {
        if (token.pool) {
          // get amount of ZIL for one unit of token
          const rate = ZilswapConnector.getExchangeRate({
            amount: BIG_ONE.shiftedBy(token.decimals),
            exactOf: "in",
            tokenInID: token.address,
            tokenOutID: ZIL_TOKEN_NAME,
            suppressLogs: true,
          });

          // times result by price
          accum[token.symbol] = zilPrice.times(rate.expectedAmount.shiftedBy(-zilToken.decimals));
        }
        return accum;
      }, { ZIL: zilPrice } as { [index: string]: BigNumber });

      if (result)
        yield put(actions.Token.updatePrices(prices));
    } finally {
      yield delay(PRICE_REFRESH_RATE);
    }
  }
}
