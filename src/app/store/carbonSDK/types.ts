import { SimpleMap } from 'app/utils'
import { CarbonSDK } from "carbon-js-sdk";
import { Network } from 'zilswap-sdk/lib/constants'

export interface CarbonSDKState {
  sdkCache: SimpleMap<CarbonSDK>
};

export interface CarbonSDKUpdateProps {
  sdk: CarbonSDK | null;
  network: Network;
};