import { Pool } from "core/zilswap";
import { TokenInfo } from "../token/types";

export interface PoolFormState {
  values: {
    [key: string]: any;
  },
  errors: {
    [key: string]: string | boolean | null;
  },
  touched: {
    [key: string]: boolean;
  },
  token: TokenInfo | null,
}

export interface PoolSelectProps {
  token: TokenInfo;
};
export interface PoolUpdateExtendedPayload {
  key: string;
  value: any;
  exchangeRate?: number;
}

export interface PoolValue {

}