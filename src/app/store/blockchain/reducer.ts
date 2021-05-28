import { Network } from "zilswap-sdk/lib/constants";
import { DefaultFallbackNetwork, LocalStorageKeys } from "app/utils/constants";
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

const reducer = (state: BlockchainState = initial_state, action: any) => {
  switch (action.type) {
    case BlockchainActionTypes.READY:
      return { ...state, ready: true }
    case BlockchainActionTypes.SET_NETWORK:
      const { network } = action
      localStorage.setItem(LocalStorageKeys.Network, network);
      return {
        ...state,
        network,
    };
    case BlockchainActionTypes.SET_ZILO_STATE: {
      const { address, state: zstate } = action;
      return {
        ...state,
        contracts: {
          ...state.contracts,
          zilo: {
            ...state.contracts.zilo,
            [address]: zstate,
          }
        }
      }
    }
    default:
      return state;
  };
}

export default reducer;
