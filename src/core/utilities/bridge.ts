import { HTTP } from "./http";
import dayjs from "dayjs";
import BigNumber from "bignumber.js";
import { bnOrZero } from "app/utils/strings/strings";

export const FEE_PREFIX = "https://dev-fees.switcheo.org";
const FEE_PATHS = {
  getFee: "/fees",
}

const fee_http = new HTTP(FEE_PREFIX, FEE_PATHS);

export interface FeesData {
  prevUpdateTime: dayjs.Dayjs;
  createWalletFee?: BigNumber;
  depositFee?: BigNumber;
  withdrawalFee?: BigNumber;
}

interface GetEstimatedFeesProp {
  denom: string;
};


export class Bridge {

  /**
   * Static function to query estimated fees.
   * 
   * @param denom denom of the selected token.
   */
  static getEstimatedFees = async ({ denom }: GetEstimatedFeesProp): Promise<FeesData> => {
    const url = fee_http.path("getFee", null, { denom })
    const response = await fee_http.get({ url });

    const { prev_update_time, details } = await response.json();
    return {
      prevUpdateTime: dayjs.unix(prev_update_time),
      createWalletFee: bnOrZero(details.createWallet?.fee),
      depositFee: bnOrZero(details.deposit?.fee),
      withdrawalFee: bnOrZero(details.withdrawal?.fee),
    }
  }
}
