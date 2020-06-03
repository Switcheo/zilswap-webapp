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

  reverseExchangeRate: boolean;

  expectedExchangeRate?: BigNumber;
  expectedSlippage?: number;
  expectedInAmount?: BigNumber;
  expectedOutAmount?: BigNumber;
};

export interface UpdateExtendedPayload {
  key: string;
  value: any;
};