import BigNumber from "bignumber.js";

export const toBasisPoints = (input: number | string | BigNumber) => {
  const value = new BigNumber(input);
  return value.shiftedBy(4);
};