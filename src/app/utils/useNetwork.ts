import { ZilswapConnector } from "core/zilswap";
import { DefaultFallbackNetwork } from "./contants";

export type GetNetworkOptions = {
  zilswapFormat?: boolean;
};

export default (opts: GetNetworkOptions = {}) => {
  const network = ZilswapConnector.network || DefaultFallbackNetwork;
  if (opts.zilswapFormat)
    return network;
  return network.toLowerCase();
};