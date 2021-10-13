import dayjs from "dayjs";
import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";
import { bnOrZero } from "app/utils";
import { HTTP } from "./http";

const FEE_PATHS = {
  getFee: "/fees",
}

const httpDevnet = new HTTP("https://dev-fees.switcheo.org", FEE_PATHS);
const httpMainnet = new HTTP("https://fees.switcheo.org", FEE_PATHS);

export interface FeesData {
  prevUpdateTime: dayjs.Dayjs;
  createWalletFee?: BigNumber;
  depositFee?: BigNumber;
  withdrawalFee?: BigNumber;
}

interface GetEstimatedFeesProp {
  denom: string;
  network: Network;
};


export class Bridge {

  /**
   * Static function to query estimated fees.
   *
   * @param denom denom of the selected token.
   */
  static getEstimatedFees = async ({ denom, network }: GetEstimatedFeesProp): Promise<FeesData> => {
    const http = network === Network.MainNet ? httpMainnet : httpDevnet;
    const url = http.path("getFee", null, { denom })
    const response = await http.get({ url });

    const { prev_update_time, details } = await response.json();
    return {
      prevUpdateTime: dayjs.unix(prev_update_time),
      createWalletFee: bnOrZero(details.createWallet?.fee),
      depositFee: bnOrZero(details.deposit?.fee),
      withdrawalFee: bnOrZero(details.withdrawal?.fee),
    }
  }
}
