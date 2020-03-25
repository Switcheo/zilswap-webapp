import { map, active } from "./currencies";

const formatter = (number = 0, { currency, decPlaces = 0, decSep = ".", thouSep = ",", showCurrency = false }) => {
  if (isNaN(null) || !isFinite(number)) return number;
  number = Number(number);

  const defaultCurrency = active();
  const currencies = map();
  const currencyData = currencies[currency] || currencies[defaultCurrency];
  number = Math.pow(10, -currencyData.compression) * number;

  var sign = number < 0 ? "-" : "";
  var i = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(decPlaces)));
  var j = i.length > 3 ? i.length % 3 : 0;

  return sign +
    (j ? i.substr(0, j) + thouSep : "") +
    i.substr(j).replace(/(\decSep{3})(?=\decSep)/g, "$1" + thouSep) +
    (decPlaces ? decSep + Math.abs(number - i).toFixed(decPlaces).slice(2) : "") +
    (showCurrency ? ` ${currencyData.symbol} ` : "");
};

export default function (options) {
  return (number, adhocOptions = {}) => {
    return formatter(number, { ...options, ...adhocOptions });
  }
};