import BigNumber from "bignumber.js";
import { BIG_ONE, BIG_ZERO } from "../constants";

const BILLION = BIG_ONE.shiftedBy(9);
const MILLION = BIG_ONE.shiftedBy(6);
const THOUSAND = BIG_ONE.shiftedBy(3);

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

export const bnOrZero = (input?: string | BigNumber | number, defaultValue: BigNumber = BIG_ZERO) => {
  if (!input) return defaultValue;
  const result = BigNumber.isBigNumber(input) ? input : new BigNumber(input);
  if (!result.isFinite() || result.isNaN())
    return defaultValue;

  return result;
};

export const toHumanNumber = (input?: string | BigNumber | number, dp: number = 5) => {
  const value = bnOrZero(input);

  if (value.lt(THOUSAND))
    return value.decimalPlaces(dp).toFormat();

  if (value.lt(MILLION))
    return `${value.shiftedBy(-3).decimalPlaces(3).toFormat()}K`

  if (value.lt(BILLION))
    return `${value.shiftedBy(-6).decimalPlaces(3).toFormat()}M`

  return `${value.shiftedBy(-9).decimalPlaces(3).toFormat()}B`
};
