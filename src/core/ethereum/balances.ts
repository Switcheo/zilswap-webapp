import BigNumber from "bignumber.js"
import { Blockchain } from 'carbon-js-sdk/lib'
import { Network } from "zilswap-sdk/lib/constants"
import { EthRpcUrl } from 'app/utils'
import { BridgeableEvmChains } from 'app/store/types'
import { HTTP } from "../utilities/http"

export interface CoinGeckoPriceResult {
  [index: string]: BigNumber
};

interface GetETHBalanceProps {
  network: Network
  walletAddress: string
  chain?: BridgeableEvmChains
};

interface GetTokenBalancesProps {
  network: Network
  tokenAddresses: string[]
  walletAddress: string
  chain?: BridgeableEvmChains
};

interface GetTokenAllowanceProps {
  network: Network
  tokenAddress: string
  walletAddress: string
  spenderAddress: string
  chain?: BridgeableEvmChains
};

/**
 * Ethereum Web3 balances API abstraction object
 */
export class ETHBalances {
  static getClient = (network: Network, chain?: BridgeableEvmChains): HTTP<{ root: string }> => {
    let url: string = EthRpcUrl[network][chain ?? Blockchain.Ethereum]

    return new HTTP(url, { root: '' })
  }

  static getETHBalance = async ({ network, walletAddress, chain }: GetETHBalanceProps): Promise<BigNumber> => {
    const client = ETHBalances.getClient(network, chain)
    const response = await client.post({
      url: client.path("root"), data: {
        id: "1",
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [walletAddress, 'latest'],
      }
    }).then(res => res.json())
    return new BigNumber(response.result)
  }

  static getTokenBalances = async ({ network, tokenAddresses, walletAddress, chain }: GetTokenBalancesProps): Promise<{ [tokenAddress: string]: BigNumber }> => {
    const client = ETHBalances.getClient(network, chain)
    const response = await client.post({
      url: client.path("root"), data: {
        id: "1",
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: [
          walletAddress,
          tokenAddresses,
        ],
      }
    }).then(res => res.json())
    return response.result.tokenBalances.reduce((acc: { [tokenAddress: string]: BigNumber }, item: { contractAddress: string, tokenBalance: string }) => {
      acc[item.contractAddress] = new BigNumber(item.tokenBalance, 16)
      return acc
    }, {})
  }

  static getTokenAllowance = async ({ network, tokenAddress, walletAddress, spenderAddress, chain }: GetTokenAllowanceProps): Promise<BigNumber> => {
    const client = ETHBalances.getClient(network, chain)
    const response = await client.post({
      url: client.path("root"), data: {
        id: "1",
        jsonrpc: "2.0",
        method: "alchemy_getTokenAllowance",
        params: [
          {
            contract: tokenAddress,
            owner: walletAddress,
            spender: spenderAddress,
          }
        ],
      }
    }).then(res => res.json())
    return new BigNumber(response.result)
  }
}
