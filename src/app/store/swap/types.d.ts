export interface SwapFormState {
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

export interface UpdateExtendedPayload {
  key: string;
  value: any;
}