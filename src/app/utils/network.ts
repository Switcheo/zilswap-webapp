import { TradeHubSDK } from "tradehub-api-js";
import { Network } from "zilswap-sdk/lib/constants";

export const netTradeHubToZil = (network: TradeHubSDK.Network): Network => {
  switch (network) {
    case TradeHubSDK.Network.MainNet: return Network.MainNet;
    default: return Network.TestNet;
  }
}

export const netZilToTradeHub = (network: Network): TradeHubSDK.Network => {
  switch (network) {
    case Network.MainNet: return TradeHubSDK.Network.MainNet;
    default: return TradeHubSDK.Network.TestNet;
  }
}
