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
  poolValues: {
    [key: string]: any;
  }
}

export interface PoolUpdateExtendedPayload {
  key: string;
  value: any;
  exchangeRate?: number;
}

export interface PoolValue {

}