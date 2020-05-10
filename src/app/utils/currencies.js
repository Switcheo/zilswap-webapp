
const currencies = {
  SGD: {
    name: "Singapore Dollars",
    compression: 2,
    symbol: "SGD",
    country_code: "sg",
  },
  USD: {
    name: "U.S. Dollars",
    compression: 2,
    symbol: "USD",
    country_code: "us",
  },
  ZIL: {
    name: "Zilliqa",
    compression: 12,
    symbol: "ZIL"
  }
};

export const active = () => "SGD";
export const map = () => JSON.parse(JSON.stringify(currencies));
export const list = () => Object.values(currencies);
export const symbols = () => Object.values(currencies).map(currency => currency.symbol);