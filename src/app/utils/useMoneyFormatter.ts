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
  if (isNaN(number.toNumber())) number = new BigNumber(0);
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
  number = number.shiftedBy(-compression);

  const positive = number.isPositive();
  const absValue = number.abs().toFixed(decPlaces);
  let [integers, decimals = "0"] = absValue.split(".");
  const firstThouSepIndex = integers.length > 3 ? integers.length % 3 : 0;
  decimals = decimals.replace(/^.*\./g, "").slice(0, maxFractionDigits).replace(/0+$/, "");
  if (decimals === "") decimals = "00".slice(0, maxFractionDigits);

  return (positive ? "" : "+") +
    (firstThouSepIndex ? integers.substr(0, firstThouSepIndex) + thouSep : "") +
    integers.substr(firstThouSepIndex).replace(/(\d{3})(?=\d)/g, "$1" + thouSep) +
    (decPlaces ? decSep + decimals : "") +
    (showCurrency ? ` ${symbol} ` : "");
};

export default function (options: MoneyFormatterOptions = {}) {
  return (number: number | string | undefined | BigNumber, adhocOptions: MoneyFormatterOptions = {}) => {
    return formatter(number, { ...options, ...adhocOptions });
  }
};
