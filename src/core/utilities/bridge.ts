import BigNumber from "bignumber.js";
import { NetworkConfigs } from "carbon-js-sdk/lib/constant";
import dayjs from "dayjs";
import { Network } from "zilswap-sdk/lib/constants";
import { bnOrZero } from "app/utils";
import { HTTP } from "./http";

const FEE_PATHS = {
  getFee: "/fees",
}

const httpDevnet = new HTTP(NetworkConfigs.devnet.feeURL, FEE_PATHS);
const httpMainnet = new HTTP(NetworkConfigs.mainnet.feeURL, FEE_PATHS);

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


export const getRecoveryAddress = (network: Network) => {
  const mainDevRecoveryAddress = 'swth1cuekk8en9zgnuv0eh4hk7xtr2kghn69x0x6u7r';
  const localTestRecoveryAddress = 'tswth1cuekk8en9zgnuv0eh4hk7xtr2kghn69xt3tv8x';
  if (network === Network.MainNet || network === Network.TestNet) {
    return mainDevRecoveryAddress;
  } else {
    return localTestRecoveryAddress;
  }
}
