import { TokenInfo } from "app/store/types";
import BigNumber from "bignumber.js";

export interface BridgeFormState {
  sourceAddress?: string; // can be eth or zil address
  destAddress?: string; // can be eth or zil address
  transferAmount: BigNumber;

  token?: TokenInfo; // might be a new DenomInfo

  isInsufficientReserves: boolean;
  forNetwork: Network | null,
};
