import BigNumber from "bignumber.js";
import { call, delay, fork, put, race, select, take } from "redux-saga/effects";
import actions from "app/store/actions";
import { RewardsActionTypes } from "app/store/rewards/actions";
import { TokenActionTypes } from "app/store/token/actions";
import { TokenInfo, TokenUSDValues } from "app/store/types";
import { SimpleMap, bnOrZero, valueCalculators } from "app/utils";
import { BIG_ONE, PollIntervals, ZIL_ADDRESS, ZIL_DECIMALS } from "app/utils/constants";
import { logger } from "core/utilities";
import { ZilswapConnector } from "core/zilswap";
import { getRewards, getTokens } from '../selectors';

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
      accum[token.address] = tokPrice;
      if (token.isZwap) window.document.title = "ZilSwap | $ZWAP - $" + tokPrice.toFixed(2);
    }
    return accum;
  }, { [ZIL_ADDRESS]: zilPrice, "zil1gvr0jgwfsfmxsyx0xsnhtlte4gks6r3yk8x5fn": zilPrice } as { [index: string]: BigNumber });
  return prices;
}

function* updatePoolUSDValues() {
  while (true) {
    logger("price saga", "update pool USD values");
    try {
      const tokenState = getTokens(yield select())
      const rewardsState = getRewards(yield select())

      if (!tokenState.prices) continue;
      if (!tokenState.initialized) continue;

      const usdValues: SimpleMap<TokenUSDValues> = {};

      for (const token of Object.values(tokenState.tokens)) {
        if (token.isZil) continue;

        const balance = valueCalculators.amount(tokenState.prices, token, bnOrZero(token.balance));
        const poolLiquidity = valueCalculators.pool(tokenState.prices, token);
        const weeklyReward = rewardsState.rewardsByPool[token.address] || [];
        const rewardsPerSecond = weeklyReward.reduce((acc, item) => {
          const token = tokenState.tokens[item.rewardToken.address];
          const value = valueCalculators.amount(tokenState.prices, token, item.amountPerEpoch)
          return acc.plus(value.div(item.currentEpochEnd - item.currentEpochStart))
        }, new BigNumber(0))

        usdValues[token.address] = {
          balance,
          poolLiquidity,
          rewardsPerSecond,
        };
      }

      yield put(actions.Token.updateUSDValues(usdValues));
    } catch (e) {
      console.warn('Fetch failed, will automatically retry later. Error:')
      console.warn(e)
    } finally {
      yield race({
        rewardsUpdated: take(RewardsActionTypes.UPDATE_POOL_REWARDS),
        usdUpdated: take(TokenActionTypes.TOKEN_UPDATE_PRICES),
        tokenUpdated: take(TokenActionTypes.TOKEN_UPDATE),
        allTokensUpdated: take(TokenActionTypes.TOKEN_UPDATE_ALL),
      });
    }
  }
}

async function getZilPrice() {
  try {
    const carbonOraclePriceUrl = "https://api.carbon.network/carbon/pricing/v1/token_price/zil.1.18.1a4a06";
    const response = await fetch(carbonOraclePriceUrl);
    const result = await response.json();
    return bnOrZero(result?.token_price?.twap);
  } catch (error) {
    return null
  }
}

function* queryUSDValues() {
  while (true) {
    logger("price saga", "query USD values");
    try {
      const { tokens } = getTokens(yield select())
      const zilPrice = (yield call(getZilPrice)) as BigNumber | null;

      if (!zilPrice)
        continue;

      const prices = computeTokenPrice(zilPrice, tokens);
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
