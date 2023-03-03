import { combineReducers } from "redux";

import preference from "./preference/reducer";
import wallet from "./wallet/reducer";
import layout from "./layout/reducer";
import stats from "./stats/reducer";
import swap from "./swap/reducer";
import token from "./token/reducer";
import pool from "./pool/reducer";
import rewards from "./rewards/reducer";
import transaction from "./transaction/reducer";
import blockchain from "./blockchain/reducer";
import bridge from "./bridge/reducer";
import marketplace from "./marketplace/reducer";
import mint from "./mint/reducer";
import carbonSDK from "./carbonSDK/reducer"

export default combineReducers({
  preference, wallet, layout, stats, swap, token, pool, rewards, transaction, blockchain, bridge, marketplace, mint, carbonSDK
});
