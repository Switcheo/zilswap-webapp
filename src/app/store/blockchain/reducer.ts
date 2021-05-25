import { DefaultFallbackNetwork, LocalStorageKeys } from "app/utils/constants";
import { Network } from "zilswap-sdk/lib/constants";
import { BlockchainState } from "./types";
import { BlockchainActionTypes } from "./actions";

const storedNetworkString = localStorage.getItem(LocalStorageKeys.Network);
const networks: { [index: string]: Network | undefined } = Network;
const storedNetwork = networks[storedNetworkString || ""] || DefaultFallbackNetwork;

const initial_state: BlockchainState = {
  ready: false,
  network: storedNetwork,
  tokens: {},
  contracts: {
    zilswap: {
      balances: {},
      output_after_fee: '9700',
      pools: {},
      total_contributions: {},
    },
    zilo: {},
  }
};

const reducer = (state: BlockchainState = initial_state, actions: any) => {
  switch (actions.type) {
    case BlockchainActionTypes.READY:
      return { ...state, ready: true }
    case BlockchainActionTypes.SET_NETWORK:
      localStorage.setItem(LocalStorageKeys.Network, actions.network);
      return {
        ...state,
        network: actions.network,
    };
    default:
      return state;
  };
}

export default reducer;
