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
  exchangeRate: BigNumber;
};

export interface UpdateExtendedPayload {
  key: string;
  value: any;
};