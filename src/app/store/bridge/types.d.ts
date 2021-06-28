import { TokenInfo } from "app/store/types";
import BigNumber from "bignumber.js";
import { Blockchain } from "tradehub-api-js";

export type BridgeableToken = {
  blockchain: Blockchain;
  tokenAddress: string;
  denom: string;
  toBlockchain: Blockchain;
  toTokenAddress: string;
  toDenom: string;
}

export interface BridgeFormState {
  sourceAddress?: string; // can be eth or zil address
  destAddress?: string; // can be eth or zil address
  transferAmount: BigNumber;

  token?: TokenInfo; // might be a new DenomInfo

  tokens: { [Blockchain]: ReadonlyArray<BridgeableToken> }

  isInsufficientReserves: boolean;
  forNetwork: Network | null,
};
