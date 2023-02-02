import BigNumber from "bignumber.js"
import { Blockchain } from 'carbon-js-sdk/lib'
import { Network } from "zilswap-sdk/lib/constants"
import { HTTP } from "../utilities/http"

export interface CoinGeckoPriceResult {
  [index: string]: BigNumber
};

interface GetETHBalanceProps {
  network: Network
  walletAddress: string
  chain?: Blockchain
};

interface GetTokenBalancesProps {
  network: Network
  tokenAddresses: string[]
  walletAddress: string
  chain?: Blockchain
};

interface GetTokenAllowanceProps {
  network: Network
  tokenAddress: string
  walletAddress: string
  spenderAddress: string
  chain?: Blockchain
};

/**
 * Ethereum Web3 balances API abstraction object
 */
export class ETHBalances {
  static getClient = (network: Network, chain?: Blockchain): HTTP<{ root: string }> => {
    let url: string

    switch (chain) {
      case Blockchain.Arbitrum:
        url = "https://arb-mainnet.g.alchemy.com/v2/Oo0CNP_yGx_RlnwX35nmH3Z--40cn-De"
        break
      default:
        url = network === Network.MainNet ?
          "https://eth-mainnet.alchemyapi.io/v2/MSB_PM1tNIxC1CD9al_iNOR5MbpcjsgS/" :
          "https://eth-goerli.alchemyapi.io/v2/Rog1kuZQf1R8X7EAmsXs7oFyQXyzIH-4"
    }
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
