
import { ContractState } from "zilswap-sdk";
import { ZiloAppState } from "zilswap-sdk/lib/zilo";
import { Network } from "zilswap-sdk/lib/constants"
import { ConnectedWallet } from "core/wallet";

export interface BlockchainState {
  ready: boolean
  network: Network
  tokens: {}
  contracts: {
    zilswap: ContractState,
    zilo: {
      [key in string]: ZiloAppState // ok, it's not just the contract state but this makes it easy for us to get derived states
    },
  }
};

export type ChainInitProps = {
  wallet: ConnectedWallet | null
  network: Network
};
