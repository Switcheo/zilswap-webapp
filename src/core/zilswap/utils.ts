import BigNumber from "bignumber.js";

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
