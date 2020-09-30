import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";
import { TokenInfo } from "../token/types";

export interface PoolFormState {
  addZilAmount: BigNumber;
  addTokenAmount: BigNumber;

  removeZilAmount: BigNumber;
  removeTokenAmount: BigNumber;

  token: TokenInfo | null,
  forNetwork: Network | null,
}

export interface PoolSelectProps {
  token: TokenInfo;
  network: Network | undefined;
};
