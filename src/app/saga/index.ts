import createSagaMiddleware from "redux-saga";
import priceSaga from "./app/priceSaga";

const sagaMiddleware = createSagaMiddleware();

export function startSagas() {
  sagaMiddleware.run(priceSaga);
};

export default sagaMiddleware;
