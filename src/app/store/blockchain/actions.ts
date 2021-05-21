import { Network } from "zilswap-sdk/lib/constants";
import { ChainInitProps } from './types'

export const BlockchainActionTypes = {
  CHAIN_INIT: "CHAIN_INIT",
  SET_NETWORK: "SET_NETWORK",
};

export type ChainInitAction = ReturnType<typeof initialize>
export function initialize(payload: ChainInitProps) {
  return {
    type: BlockchainActionTypes.CHAIN_INIT,
    payload
  }
};

export function setNetwork(network: Network) {
  return {
    type: BlockchainActionTypes.SET_NETWORK,
    network,
  }
};
