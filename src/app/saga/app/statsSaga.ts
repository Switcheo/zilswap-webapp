import { actions } from "app/store";
import { PoolLiquidityMap } from "app/store/types";
import { STATS_REFRESH_RATE } from "app/utils/constants";
import { logger, ZAPStats, SwapVolume, GetLiquidityOpts } from "core/utilities";
import dayjs from "dayjs";
import { delay, fork, put, select } from "redux-saga/effects";
import { Network } from "zilswap-sdk/lib/constants";
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
    const volumeDay: SwapVolume[] = yield ZAPStats.getSwapVolume({
      network,
      from: dayjs().add(-1, "d").unix(),
    });

    yield put(actions.Stats.setSwapVolumes(volumeDay));
  } catch (error) {
    console.error(error);
  }
};

function* queryPoolLiquidityDay({ network }: QueryOpts) {
  try {
    const liquiditySnapshot24hAgo: PoolLiquidityMap = yield fetchPoolLiquidity({
      network,
      timestamp: dayjs().add(-1, "d").unix(),
    });
    const liquiditySnapshotNow: PoolLiquidityMap = yield fetchPoolLiquidity({
      network,
    });

    const liquidityChange24h = liquiditySnapshotNow;
    for (const key in liquiditySnapshot24hAgo) {
      const snapshot24hAgo = liquiditySnapshot24hAgo[key]
      liquidityChange24h[key] = liquidityChange24h[key].minus(snapshot24hAgo);
    }

    yield put(actions.Stats.setLiquidityChange24h(liquidityChange24h));
  } catch (error) {
    console.error(error);
  }
};

function* watchStats() {
  logger("run watch stats");
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
