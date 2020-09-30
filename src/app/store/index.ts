import { applyMiddleware, createStore, Middleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import { createLogger } from "redux-logger";
import thunk from "redux-thunk";
import combinedReducers from "./reducers";

const middlewares: Middleware[] = [thunk];
if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
  middlewares.push(createLogger());

// redux 4 does not have a easy workaround createStore needing 4 type arguments.
// @ts-ignore
const AppStore = createStore(combinedReducers, composeWithDevTools(
  applyMiddleware(...middlewares)
));

export { default as actions } from "./actions";

export default AppStore;
