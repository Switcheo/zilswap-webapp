import { bytes, units } from "@zilliqa-js/util";
import { Zilswap } from "zilswap-sdk";

let zilliqa: any;

export const setZilliqa = (newZil: Zilswap) => {
  zilliqa = newZil
}

export const getZilliqa = (): Zilswap | any => {
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