
import { ContractState } from "zilswap-sdk";
import { Network } from "zilswap-sdk/lib/constants"
import { ZiloContractState } from "zilswap-sdk/lib/zilo";
import { ConnectedWallet } from "core/wallet";

export interface BlockchainState {
  ready: boolean
  network: Network
  tokens: {}
  contracts: {
    zilswap: ContractState,
    zilo: {
      [key in string]: ZiloContractState
    },
  }
};

export type ChainInitProps = {
  wallet: ConnectedWallet | null
  network: Network
};
