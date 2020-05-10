import { Zilliqa } from "@zilliqa-js/zilliqa";
import { bytes, units } from "@zilliqa-js/util";

let zilliqa: any;

export const setZilliqa = (newZil: Zilliqa) => {
  zilliqa = newZil
}

export const getZilliqa = (): Zilliqa => {
  return zilliqa;
};

export const logout = () => {
  zilliqa = undefined;
}


// mainnet, it is 65537.
export const chainId = 333; // chainId of the developer testnet
export const msgVersion = 1; // current msgVersion
export const VERSION = bytes.pack(chainId, msgVersion);

export const ZilUrl = "https://dev-api.zilliqa.com/";

export const ZilUnits = {
  // @ts-ignore
  Zil: units.Units.Zil,
  // @ts-ignore
  Li: units.Units.Li,
  // @ts-ignore
  Qa: units.Units.Qa,
};