import dayjs from "dayjs";
import { delay, fork, put, select } from "redux-saga/effects";
import { Network } from "zilswap-sdk/lib/constants";
import { GetLiquidityOpts, SwapVolume, ZAPStats, logger } from "core/utilities";
import { STATS_REFRESH_RATE } from "app/utils/constants";
import { PoolLiquidityMap } from "app/store/types";
import { actions } from "app/store";
import { getBlockchain } from "../selectors";

interface QueryOpts {
  network: Network;
}

const fetchPoolLiquidity = async (opts: GetLiquidityOpts) => {
  const poolLiquidities = await ZAPStats.getLiquidity(opts);
  const liquidityMap = poolLiquidities.reduce((map, pool) => {
    map[pool.pool] = pool.amount;
    return map;
  }, {} as PoolLiquidityMap);
  return liquidityMap;
}

function* queryVolumeDay({ network }: QueryOpts) {
  try {
    const aDayAgo = dayjs().add(-1, "d").unix();
    // stick query to last 5 minutes to improve cache
    const refTime =  aDayAgo - aDayAgo % 300;
    const volumeDay: SwapVolume[] = yield ZAPStats.getSwapVolume({
      network,
      from: refTime,
    });

    yield put(actions.Stats.setSwapVolumes(volumeDay));
  } catch (error) {
    console.error(error);
  }
};

function* queryPoolLiquidityDay({ network }: QueryOpts) {
  try {
    const now = dayjs().unix();
    // stick query to last 5 minutes to improve caching
    const refTime =  now - now % 300;
    const liquiditySnapshot24hAgo: PoolLiquidityMap = yield fetchPoolLiquidity({
      network,
      timestamp: refTime - 86400,
    });
    const liquiditySnapshotNow: PoolLiquidityMap = yield fetchPoolLiquidity({
      network,
      timestamp: refTime,
    });

    const liquidityChange24h = liquiditySnapshotNow;
    for (const key in liquiditySnapshot24hAgo) {
      // TODO: proper token blacklist
      if (key === "zil13c62revrh5h3rd6u0mlt9zckyvppsknt55qr3u") continue;
      const snapshot24hAgo = liquiditySnapshot24hAgo[key]
      liquidityChange24h[key] = liquidityChange24h[key].minus(snapshot24hAgo);
    }

    yield put(actions.Stats.setLiquidityChange24h(liquidityChange24h));
  } catch (error) {
    console.error(error);
  }
};

function* watchStats() {
  while (true) {
    const { network } = getBlockchain(yield select())
    const queryOpts = { network };
    try {
      yield fork(queryVolumeDay, queryOpts);
      yield fork(queryPoolLiquidityDay, queryOpts);
    } catch (error) {
      console.error(error);
    } finally {
      yield delay(STATS_REFRESH_RATE);
    }
  }
}

export default function* statsSaga() {
  logger("init stats saga");
  yield fork(watchStats);
}
