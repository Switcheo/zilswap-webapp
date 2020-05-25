import { Pool } from "core/zilswap";
import { TokenInfo } from "../token/types";
import BigNumber from "bignumber.js";

export interface PoolFormState {
  addZilAmount: BigNumber;
  addTokenAmount: BigNumber;

  removeZilAmount: BigNumber;
  removeTokenAmount: BigNumber;

  token: TokenInfo | null,
}

export interface PoolSelectProps {
  token: TokenInfo;
};