import { Network } from "zilswap-sdk/lib/constants";
import { ZAPStats } from "../utilities/zap-stats";


export interface GetDistributionOpts {
  address: string;
  network: Network;
};

export const getDistribution = async (opts: GetDistributionOpts) => {
  return await ZAPStats.getZWAPDistributions({ ...opts });
};
