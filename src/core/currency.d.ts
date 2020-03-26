export enum CurrencySymbol {
  USD,
}
export enum CurrencyType {
  Fiat,
  Crypto
}

export type Currency = {
  symbol: CurrencySymbol,
  type: CurrencyType,
  denom: number,
}