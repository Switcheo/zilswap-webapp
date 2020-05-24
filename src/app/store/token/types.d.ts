import { ConnectedWallet } from "core/wallet/wallet";
import { BN } from "@zilliqa-js/util";
import BigNumber from "bignumber.js";

export type TokenBalanceMap = {
  [index: string]: BN;
};

export type TokenInfo = {
  symbol: string;
  name: string;
  decimals: number;
  init_supply: BN;
  address: string;
  balances: TokenBalanceMap;
};

export interface TokenState {
  initialized: boolean,
  tokens: { [index: string]: TokenInfo },
};

export interface TokenUpdateProps {
  symbol: string;
  name: string;
  decimals: number;
  init_supply: BN;
  address: string;
};

export interface TokenInitProps {
  tokens: { [index: string]: TokenInfo },
};