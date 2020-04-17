export interface PoolFormState {
  values: {
    [key: string]: any;
  },
  errors: {
    [key: string]: string | boolean | null;
  },
  touched: {
    [key: string]: boolean;
  }
}

export interface PoolUpdateExtendedPayload {
  key: string;
  value: any;
}