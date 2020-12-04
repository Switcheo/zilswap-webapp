import { map, active } from "./currencies";
import BigNumber from "bignumber.js";

export type MoneyFormatterOptions = {
  currency?: any;
  symbol?: string;
  compression?: number;
  decPlaces?: number;
  maxFractionDigits?: number;
  showCurrency?: boolean;
}

const formatter = (inputNumber: BigNumber | number | string = 0, opts: MoneyFormatterOptions = {}): string => {
  if (typeof inputNumber === "string") inputNumber = Number(inputNumber);
  if (typeof inputNumber === "number") {
    if (isNaN(inputNumber) || !isFinite(inputNumber))
      return `${inputNumber}`;
  }
  let number = new BigNumber(inputNumber);
  if (isNaN(number.toNumber())) number = new BigNumber(0);
  let { currency, symbol, compression = 0, decPlaces, maxFractionDigits = 2, showCurrency = false } = opts;

  if (decPlaces === undefined)
    decPlaces = maxFractionDigits || 0;

  if (currency && !compression) {
    const defaultCurrency = active();
    const currencies = map();
    const currencyData = currencies[currency] || currencies[defaultCurrency];
    compression = currencyData.compression;
    symbol = currencyData.symbol;
  }
  number = number.shiftedBy(-compression);

  return `${number.decimalPlaces(decPlaces).toFormat()}${showCurrency ? ` ${symbol || currency}` : ""}`.trim()
};

export default function (options: MoneyFormatterOptions = {}) {
  return (number: number | string | undefined | BigNumber, adhocOptions: MoneyFormatterOptions = {}) => {
    return formatter(number, { ...options, ...adhocOptions });
  }
};
