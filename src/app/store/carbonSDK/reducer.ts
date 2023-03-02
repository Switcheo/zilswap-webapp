import { CarbonSDK } from "carbon-js-sdk";
import { Network } from 'zilswap-sdk/lib/constants'
import { CarbonSDKState } from './types'
import { CarbonSDKActionTypes } from './actions'


const initial_state: CarbonSDKState = {
  sdkCache: {},
};

const reducer = (state: CarbonSDKState = initial_state, action: any) => {
  switch (action.type) {
    case CarbonSDKActionTypes.UPDATE_SDK: {
      const { payload } = action;
      const sdk: CarbonSDK | null = payload.sdk;
      const network: Network = payload.network
      if (sdk) {
        state.sdkCache[network] = sdk
      }
      
      return state;
    }
    default:
      return state;
  };
}

export default reducer;