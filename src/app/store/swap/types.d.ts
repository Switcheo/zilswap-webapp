import { TokenInfo } from "app/store/types";
import BigNumber from "bignumber.js";


export type ExactOfOptions = "in" | "out";

export interface SwapFormState {
  slippage: number;
  expiry: number;


  percentage: BigNumber;
  exactOf: ExactOfOptions;

  poolToken?: TokenInfo;

  inToken?: TokenInfo;
  inAmount: BigNumber;

  outToken?: TokenInfo;
  outAmount: BigNumber;

  expectedExchangeRate?: BigNumber;
  expectedSlippage?: number;
};

export interface UpdateExtendedPayload {
  key: string;
  value: any;
};