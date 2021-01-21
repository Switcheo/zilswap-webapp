import { actions } from "app/store";
import { PoolLiquidityMap, RootState } from "app/store/types";
import { STATS_REFRESH_RATE } from "app/utils/constants";
import { logger, ZAPStats, GetLiquidityOpts } from "core/utilities";
import moment from "moment";
import { delay, fork, put, select } from "redux-saga/effects";
import { Network } from "zilswap-sdk/lib/constants";

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
    const volumeDay = yield ZAPStats.getSwapVolume({
      network,
      from: moment().add(-1, "d").unix(),
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
      timestamp: moment().add(-1, "d").unix(),
    });
    const liquiditySnapshotNow: PoolLiquidityMap = yield fetchPoolLiquidity({
      network,
    });

    const liquidityChange24h = liquiditySnapshotNow;
    for (const key in liquiditySnapshot24hAgo) {
      const snapshot24hAgo = liquiditySnapshot24hAgo[key]
      liquidityChange24h[key] = liquidityChange24h[key].minus(snapshot24hAgo);
    }

    console.log(liquidityChange24h);
    yield put(actions.Stats.setLiquidityChange24h(liquidityChange24h));
  } catch (error) {
    console.error(error);
  }
};

export default function* statsSaga() {
  logger("init stats saga");

  while (true) {
    logger("run stats saga");
    const network = yield select((state: RootState) => state.layout.network);
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
