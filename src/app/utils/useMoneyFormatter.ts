import { map, active } from "./currencies";
import BigNumber from "bignumber.js";

export type MoneyFormatterOptions = {
  currency?: any;
  symbol?: string;
  compression?: number;
  decPlaces?: number;
  maxFractionDigits?: number;
  decSep?: string;
  thouSep?: string;
  showCurrency?: boolean;
}

const formatter = (inputNumber: BigNumber | number | string = 0, opts: MoneyFormatterOptions = {}): string => {
  if (typeof inputNumber === "string") inputNumber = Number(inputNumber);
  if (typeof inputNumber === "number") {
    if (isNaN(inputNumber) || !isFinite(inputNumber))
      return `${inputNumber}`;
  }
  let number = new BigNumber(inputNumber);
  let { currency, symbol = "", compression = 0, decPlaces, maxFractionDigits = 2, decSep = ".", thouSep = ",", showCurrency = false } = opts;

  if (decPlaces === undefined)
    decPlaces = maxFractionDigits || 0;

  if (currency && !compression) {
    const defaultCurrency = active();
    const currencies = map();
    const currencyData = currencies[currency] || currencies[defaultCurrency];
    compression = currencyData.compression;
    symbol = currencyData.symbol;
  }
  number = number.times(new BigNumber(10).pow(-compression));

  const positive = number.isPositive();
  const absValue = number.abs();
  const integers = absValue.toFixed(0);
  const firstThouSepIndex = integers.length > 3 ? integers.length % 3 : 0;
  const decimals = absValue.toFixed(decPlaces).replace(/^.*\./g, "");

  return (positive ? "" : "+") +
    (firstThouSepIndex ? integers.substr(0, firstThouSepIndex) + thouSep : "") +
    integers.substr(firstThouSepIndex).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
    (decPlaces ? decSep + decimals.slice(0, maxFractionDigits) : "") +
    (showCurrency ? ` ${symbol} ` : "");
};

export default function (options: MoneyFormatterOptions = {}) {
  return (number: number | string | BigNumber, adhocOptions: MoneyFormatterOptions = {}) => {
    return formatter(number, { ...options, ...adhocOptions });
  }
};