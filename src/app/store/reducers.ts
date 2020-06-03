import { combineReducers } from "redux";

import preference from "./preference/reducer";
import wallet from "./wallet/reducer";
import layout from "./layout/reducer";
import token from "./token/reducer";
import swap from "./swap/reducer";
import pool from "./pool/reducer";
import transaction from "./transaction/reducer";

export default combineReducers({
  preference, wallet, layout, swap, pool, token, transaction,
});
