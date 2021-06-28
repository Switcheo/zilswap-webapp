import actions from "app/store/actions";
import { RewardsActionTypes } from "app/store/rewards/actions";
import { TokenActionTypes } from "app/store/token/actions";
import { TokenInfo, TokenUSDValues } from "app/store/types";
import { SimpleMap, valueCalculators } from "app/utils";
import { BIG_ONE, BIG_ZERO, PollIntervals, ZIL_ADDRESS, ZIL_DECIMALS } from "app/utils/constants";
import { bnOrZero } from "app/utils/strings/strings";
import BigNumber from "bignumber.js";
import { logger } from "core/utilities";
import { CoinGecko, CoinGeckoPriceResult } from "core/utilities/coingecko";
import { ZilswapConnector } from "core/zilswap";
import { ZWAPRewards } from "core/zwap";
import { call, delay, fork, put, race, select, take } from "redux-saga/effects";
import { getBlockchain, getTokens, getRewards } from '../selectors'

const computeTokenPrice = (zilPrice: BigNumber, tokens: SimpleMap<TokenInfo>) => {
  const prices = Object.values(tokens).reduce((accum, token) => {
    if (token.pool) {
      // get amount of ZIL for one unit of token
      const rate = ZilswapConnector.getExchangeRate({
        amount: BIG_ONE.shiftedBy(token.decimals),
        exactOf: "in",
        tokenInID: token.address,
        tokenOutID: ZIL_ADDRESS,
        suppressLogs: true,
      });

      // times result by price
      const tokPrice = zilPrice.times(rate.expectedAmount.shiftedBy(-ZIL_DECIMALS));
      accum[token.symbol] = tokPrice;
      if (token.isZwap) window.document.title = "ZilSwap | $ZWAP - $" + tokPrice.toFixed(2);
    }
    return accum;
  }, { ZIL: zilPrice } as { [index: string]: BigNumber });
  return prices;
}

function* updatePoolUSDValues() {
  while (true) {
    logger("price saga", "update pool USD values");
    try {
      const tokenState = getTokens(yield select())
      const rewardsState = getRewards(yield select())
      const blockchainState = getBlockchain(yield select())

      if (!tokenState.prices) continue;
      if (!tokenState.initialized) continue;

      const usdValues: SimpleMap<TokenUSDValues> = {};
      const zapContractAddr: string = ZWAPRewards.TOKEN_CONTRACT[blockchainState.network] ?? "";
      const zapToken = tokenState.tokens[zapContractAddr];

      for (const token of Object.values(tokenState.tokens)) {
        if (token.isZil) continue;

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
    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      yield race({
        rewardsUpdated: take(RewardsActionTypes.UPDATE_ZWAP_REWARDS),
        usdUpdated: take(TokenActionTypes.TOKEN_UPDATE_PRICES),
        tokenUpdated: take(TokenActionTypes.TOKEN_UPDATE),
        allTokensUpdated: take(TokenActionTypes.TOKEN_UPDATE_ALL),
      });
    }
  }
}

function* queryUSDValues() {
  const coinGeckoZilName = "zilliqa";
  const coinGeckoQuoteDenom = "usd";

  while (true) {
    logger("price saga", "query USD values");
    try {
      const { tokens } = getTokens(yield select())
      const result = (yield call(CoinGecko.getPrice, {
        coins: [coinGeckoZilName],
        quote: coinGeckoQuoteDenom,
      })) as CoinGeckoPriceResult | undefined;

      const zilPrice = result?.zilliqa;
      if (!zilPrice)
        continue;

      const prices = computeTokenPrice(zilPrice, tokens);

      if (result)
        yield put(actions.Token.updatePrices(prices));
    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
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
