import { Zilliqa } from "@zilliqa-js/zilliqa";
import { bytes } from "@zilliqa-js/util";

export const zilliqa = new Zilliqa('https://dev-api.zilliqa.com/');


// mainnet, it is 65537.
export const chainId = 333; // chainId of the developer testnet
export const msgVersion = 1; // current msgVersion
export const VERSION = bytes.pack(chainId, msgVersion);