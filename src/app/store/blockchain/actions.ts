import { Network } from "zilswap-sdk/lib/constants";
import { ZiloAppState } from "zilswap-sdk/lib/zilo";
import { ChainInitProps } from './types'

export const BlockchainActionTypes = {
  READY: "CHAIN_READY",
  INITIALIZED: "CHAIN_INITIALIZED",
  CHAIN_INIT: "CHAIN_INIT",
  SET_NETWORK: "SET_NETWORK",
  SET_ZILO_STATE: "SET_ZILO_STATE",
};

// inform app that blockchain saga has been started
export function ready() {
  return { type: BlockchainActionTypes.READY }
}

// inform other sagas that first blockchain state load has been completed
export function initialized() {
  return { type: BlockchainActionTypes.INITIALIZED }
}

export type ChainInitAction = ReturnType<typeof initialize>
export function initialize(payload: ChainInitProps) {
  return {
    type: BlockchainActionTypes.CHAIN_INIT,
    payload
  }
};

export function setZiloState(address: string, state: ZiloAppState) {
  return {
    type: BlockchainActionTypes.SET_ZILO_STATE,
    address,
    state,
  }
}

export function setNetwork(network: Network) {
  return {
    type: BlockchainActionTypes.SET_NETWORK,
    network,
  }
};
