import BigNumber from "bignumber.js";
import { Pool } from "zilswap-sdk";
import { SimpleMap } from "app/utils";

export type TokenUSDValues = {
  balance: BigNumber;
  poolLiquidity: BigNumber;
  zapRewards: BigNumber;
};

export type TokenInfo = {
  initialized: boolean;
  isZil: boolean;
  isZwap: boolean;
  registered: boolean;
  whitelisted: boolean;
  symbol: string;
  name?: string;
  decimals: number;
  address: string;
  balance?: BigNumber;
  pool?: Pool;
  allowances?: { [index: string]: string };
  blockchain: Blockchain;
};

export interface TokenState {
  initialized: boolean,
  prices: SimpleMap<BigNumber>,
  tokens: SimpleMap<TokenInfo>,
  values: SimpleMap<TokenUSDValues>,
};

export interface TokenUpdateProps extends Partial<TokenInfo> {
  address: string;
};

export interface TokenUpdateAllProps {
  [index: string]: TokenUpdateProps;
};

export interface TokenInitProps {
  tokens: { [index: string]: TokenInfo };
};
export interface TokenAddProps {
  token: TokenInfo;
};

export interface UpdatePriceProps {
  [index: string]: BigNumber;
};

export interface UpdateUSDValuesProps {
  [index: string]: TokenUSDValues;
};
