import { combineReducers } from "redux";

import preference from "./preference/reducer";
import wallet from "./wallet/reducer";
import layout from "./layout/reducer";

export default combineReducers({
  preference, wallet, layout,
});
