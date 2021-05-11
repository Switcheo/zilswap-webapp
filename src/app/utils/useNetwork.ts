import { ZilswapConnector } from "core/zilswap";
import { DefaultFallbackNetwork } from "./constants";

export type GetNetworkOptions = {
  zilswapFormat?: boolean;
};

const useNetwork = (opts: GetNetworkOptions = {}) => {
  const network = ZilswapConnector.network || DefaultFallbackNetwork;
  if (opts.zilswapFormat)
    return network;
  return network.toLowerCase();
};

export default useNetwork;
