import createSagaMiddleware from "redux-saga";
import blockchainSaga from "./app/blockchainSaga";
import bridgeSaga from "./app/bridgeSaga";
import priceSaga from "./app/priceSaga";
import statsSaga from "./app/statsSaga";
import tokensSaga from "./app/tokensSaga";
import rewardsSaga from "./app/rewardsSaga";
import marketPlaceSaga from "./app/marketplaceSaga";

const sagaMiddleware = createSagaMiddleware();

export function startSagas() {
  sagaMiddleware.run(blockchainSaga);
  sagaMiddleware.run(tokensSaga);
  sagaMiddleware.run(bridgeSaga);
  sagaMiddleware.run(priceSaga);
  sagaMiddleware.run(statsSaga);
  sagaMiddleware.run(rewardsSaga);
  sagaMiddleware.run(marketPlaceSaga);
};

export default sagaMiddleware;
