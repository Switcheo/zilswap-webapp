import actions from "app/store/actions";
import { RewardsActionTypes } from "app/store/rewards/actions";
import { TokenActionTypes } from "app/store/token/actions";
import { RewardsState, RootState, TokenInfo, TokenState, TokenUSDValues } from "app/store/types";
import { SimpleMap, valueCalculators } from "app/utils";
import { BIG_ONE, BIG_ZERO, PollIntervals, ZIL_TOKEN_NAME } from "app/utils/constants";
import { bnOrZero } from "app/utils/strings/strings";
import BigNumber from "bignumber.js";
import { logger } from "core/utilities";
import { CoinGecko, CoinGeckoPriceResult } from "core/utilities/coingecko";
import { ZilswapConnector } from "core/zilswap";
import { ZWAPRewards } from "core/zwap";
import { call, delay, fork, put, race, select, take } from "redux-saga/effects";

function* updatePoolUSDValues() {
  while (true) {
    logger("update pool USD values");
    try {
      const tokenState = (yield select((state: RootState) => state.token)) as TokenState;
      const rewardsState = (yield select((state: RootState) => state.rewards)) as RewardsState;

      if (!tokenState.prices) continue;
      if (!tokenState.initialized) continue;
      if (!ZilswapConnector.network) continue;

      const usdValues: SimpleMap<TokenUSDValues> = {};
      const zapContractAddr: string = ZWAPRewards.TOKEN_CONTRACT[ZilswapConnector.network] ?? "";
      const zapToken = tokenState.tokens[zapContractAddr];

      for (const token of Object.values(tokenState.tokens)) {
        if (token.isZil || !token.initialized) continue;

        const balance = valueCalculators.amount(tokenState.prices, token, bnOrZero(token.balance));
        const poolLiquidity = valueCalculators.pool(tokenState.prices, token);
        const weeklyReward = rewardsState.rewardByPools[token.address]?.weeklyReward
        const zapRewards = valueCalculators.amount(tokenState.prices, zapToken, weeklyReward ?? BIG_ZERO);

        usdValues[token.address] = {
          balance,
          poolLiquidity,
          zapRewards,
        };
      }

      yield put(actions.Token.updateUSDValues(usdValues));
    } finally {
      yield race({
        rewardsUpdated: take(RewardsActionTypes.UPDATE_ZWAP_REWARDS),
        usdUpdated: take(TokenActionTypes.TOKEN_UPDATE_PRICES),
      });
    }
  }
}

function* queryUSDValues() {
  const coinGeckoZilName = "zilliqa";
  const coinGeckoQuoteDenom = "usd";

  while (true) {
    logger("query USD values");
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
      yield delay(PollIntervals.USDRates);
    }
  }
}



export default function* priceSaga() {
  logger("init price saga");
  yield fork(queryUSDValues);
  yield fork(updatePoolUSDValues);
}
