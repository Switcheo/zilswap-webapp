import { Zilliqa } from "@zilliqa-js/zilliqa";
import { bytes, units } from "@zilliqa-js/util";

let zilliqa: Zilliqa;

export const setZilliqa = (newZil: Zilliqa) => {
  zilliqa = newZil
}

export const getZilliqa = (): Zilliqa => {
  return zilliqa;
};


// mainnet, it is 65537.
export const chainId = 333; // chainId of the developer testnet
export const msgVersion = 1; // current msgVersion
export const VERSION = bytes.pack(chainId, msgVersion);

export const ZilUnits = {
  // @ts-ignore
  Zil: units.Units.Zil,
  // @ts-ignore
  Li: units.Units.Li,
  // @ts-ignore
  Qa: units.Units.Qa,
};