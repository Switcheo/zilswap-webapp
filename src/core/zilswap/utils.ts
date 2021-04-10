import BigNumber from "bignumber.js";
import { Contract } from "./reexport";
import { HTTP } from "core/utilities";

/**
 * Helper function to convert numeric input to basispoints form.
 * 
 * ```
 * toBasisPoints(0.01)    // = 100 bp (1%)
 * toBasisPoints(0.0005)  // = 5 bp (0.05%)
 * toBasisPoints(1)       // = 10000 bp (100%)
 * ```
 * 
 * @param input value in standard form.
 * @returns BigNumber representation of result.
 */
export const toBasisPoints = (input: number | string | BigNumber) => {
  const value = new BigNumber(input);
  return value.shiftedBy(4);
};

/**
 * Helper function to extract balances map from token contract.
 * @param contract zilliqa SDK contract
 * @returns balances map or undefined if not present.
 */
export const getBalancesMap = async (contract: Contract) => {
  let result: any;
  let contractBalanceState: any;
  result = await contract.getSubState("balances");
  contractBalanceState = result?.balances;
  if (!contractBalanceState) {
    // check for legacy balances map definition.
    result = await contract.getSubState("balances_map");
    contractBalanceState = result?.balances_map;
  }
  return contractBalanceState;
}

/**
 * Helper function to extract allowances map from token contract.
 * @param contract zilliqa SDK contract
 * @returns balances map or undefined if not present.
 */
export const getAllowancesMap = async (contract: Contract) => {
  let result: any;
  let contractAllowancesMap: any;
  result = await contract.getSubState("allowances");
  contractAllowancesMap = result?.allowances;
  return contractAllowancesMap;
}

export const updateTitle = async (): Promise<void> => {
  const zilStreamUrl = "https://api.zilstream.com";
  const http = new HTTP(zilStreamUrl, { rates: "/rates" });
  const url = http.path("rates");
  const response = await http.get({ url });
  const results  = await response.json();
  let zwapValue = new BigNumber(0);
  let zilValue = new BigNumber(0);

  if(Array.isArray(results)) {
    results.forEach(token => {
      if (token.token_id === 1) zilValue = new BigNumber(token.value);
      if (token.token_id === 3) zwapValue = new BigNumber(token.value);
    })
  }

  if(!zwapValue.isZero() && zwapValue.isPositive() && !zilValue.isZero() && zilValue.isPositive()) {
    const zwap_price_label = zwapValue.div(new BigNumber(1).div(zilValue)).toFixed(2);
    window.document.title = "Zilswap - $" + zwap_price_label;
  }
}