import { combineReducers } from "redux";

import preference from "./preference/reducer";
import layout from "./layout/reducer";

export default combineReducers({
  preference, layout,
});
