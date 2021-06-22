import { TokenInfo } from "app/store/types";
import BigNumber from "bignumber.js";

export interface BridgeFormState {
  sourceAddress?: string;
  transferAmount: BigNumber;

  token?: TokenInfo;

  isInsufficientReserves: boolean;
  forNetwork: Network | null,
};
