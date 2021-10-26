import { normaliseAddress, toBech32Address } from "@zilliqa-js/crypto";
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { BIG_ONE, BIG_ZERO } from "./constants";
import { truncate } from ".";

const BILLION = BIG_ONE.shiftedBy(9);
const MILLION = BIG_ONE.shiftedBy(6);

export const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

export const parseBN = (input?: string | BigNumber | number | null, defaultValue?: BigNumber) => {
  if (!input && input !== 0) return defaultValue;
  const result = BigNumber.isBigNumber(input) ? input : new BigNumber(input);
  if (!result.isFinite() || result.isNaN())
    return defaultValue;

  return result;
};

export const bnOrZero = (input?: string | BigNumber | number | null, defaultValue: BigNumber = BIG_ZERO) => {
  return parseBN(input, defaultValue)!;
};

export const toSignificantNumber = (input: BigNumber): string => {
  if (input.lt(1)) {
    const zeroesAfterDecimal = input.toString().split("0").length
    return input.toFormat(zeroesAfterDecimal + 4).replace(/[0]*$/, '') // 4 s.f
  }
  if (input.lt(100))
    return input.toFormat(2) // 4 s.f.
  return input.toFormat(0)
}

export const toHumanNumber = (input?: string | BigNumber | number, dp: number = 5) => {
  const value = bnOrZero(input);

  if (value.lt(BIG_ONE.shiftedBy(dp)))
    return value.decimalPlaces(dp).toFormat();

  if (value.lt(MILLION))
    return `${value.shiftedBy(-3).decimalPlaces(dp).toFormat()}K`

  if (value.lt(BILLION))
    return `${value.shiftedBy(-6).decimalPlaces(dp).toFormat()}M`

  return `${value.shiftedBy(-9).decimalPlaces(dp).toFormat()}B`
};

export const tryGetBech32Address = (input: string | undefined | null) => {
  try {
    return toBech32Address(normaliseAddress(input!));
  } catch (error) { };
  return null;
}

export const truncateAddress = (input: string, forSmallScreen: boolean = false): string => {
  let i = input
  if (input.startsWith("0x")) {
    i = toBech32Address(input)
  }
  return truncate(i, 5, forSmallScreen ? 2 : 5)
}

export const formatZWAPLabel = (input: BigNumber) => {
  const amount = input.shiftedBy(-12);
  if (!amount.isZero() && amount.lt(0.01)) return "<0.01";
  return amount.toFormat(2);
};

export interface DataCoder<T = unknown> {
  encode: (object: T) => object;
  decode: (data: object) => T;
}
export namespace DataCoder {
  export const decodeDayjs = (input: number | undefined) => typeof input === "undefined" ? undefined : dayjs.unix(input);
  export const encodeDayjs = (input: dayjs.Dayjs | undefined) => input?.unix();
}
