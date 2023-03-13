import { Blockchain, CarbonSDK, ConnectedCarbonSDK } from 'carbon-js-sdk'
import { Token } from 'carbon-js-sdk/lib/codec'
import { SimpleMap } from 'carbon-js-sdk/lib/util/type'
import { Network } from "zilswap-sdk/lib/constants"
import { BridgeableChains, BridgeableEvmChains } from 'app/store/types'
import { BRIDGEABLE_CHAINS, BRIDGEABLE_EVM_CHAINS, EthRpcUrl } from './constants'

/**
 * Returns the mapping of chains to their respective SWTH denom
 * @param {CarbonSDK.Network} network the carbonSDK network to query the list for
 * @returns {SimpleMap<string>}
 */
export const getTokenDenomList = (network: CarbonSDK.Network): SimpleMap<string> => {
  const mainTokenDenoms: SimpleMap<string> = {
    [Blockchain.Ethereum]: "swthe.1.2.683ddd",
    [Blockchain.BinanceSmartChain]: "swth.1.6.5bc06b",
    [Blockchain.Carbon]: "swth",
    [Blockchain.Zilliqa]: "swth.1.18.4ef38b",
    [Blockchain.Neo]: "swthn.1.4.2624e1",
    [Blockchain.Neo3]: "swth.1.14.fffdbf",
    [Blockchain.Arbitrum]: "swth.1.19.6f83d0",
    [Blockchain.Polygon]: "swth.1.17.dbb4d5",
  }
  // const devTokenDenoms: SimpleMap<string> = {
  //     [Blockchain.Ethereum]: "swth1.1.350.9d90c3",
  //     [Blockchain.BinanceSmartChain]: "swth2.1.350.6da2b8",
  //     [Blockchain.Carbon]: "swth.1.111.7742c9",
  //     [Blockchain.Zilliqa]: "zil1.1.111.f0354c",
  //     [Blockchain.Neo]: "",
  //     [Blockchain.Neo3]: "",
  // }
  const testTokenDenoms: SimpleMap<string> = {
    [Blockchain.Ethereum]: "swth.1.502.976cb7",
    [Blockchain.BinanceSmartChain]: "",
    [Blockchain.Carbon]: "",
    [Blockchain.Zilliqa]: "swth.1.111.ae86f6",
    [Blockchain.Neo]: "",
    [Blockchain.Neo3]: "",
  }
  if (network === CarbonSDK.Network.MainNet) {
    return mainTokenDenoms
  } else {
    return testTokenDenoms
  }
}

/**
 * Returns the SWTH denom on the specified chain
 * @param {CarbonSDK.Network} network the carbonSDK network to query the list of SWTH denoms
 * @param {Blockchain} chain the chain to query the SWTH denom for
 * @returns {SimpleMap<string>}
 */
export const getTokenDenoms = (network: CarbonSDK.Network, chain: Blockchain) => {
  return getTokenDenomList(network)[chain]
}

/**
 * Returns a mapping of chains to their respective SWTH token info
 * @param {CarbonSDK.Network} network 
 * @returns {SimpleMap<Token>}
 */
export const getSwthBridgeTokens = async (network: CarbonSDK.Network) => {
  var ret: SimpleMap<Token> = {}
  const carbonSdk: CarbonSDK = await CarbonSDK.instance({ network })
  const carbonTokens: Token[] = Object.values(carbonSdk.token.tokens)
  const swthBridgeDenoms = getTokenDenomList(network)
  Object.entries(swthBridgeDenoms).forEach(([chain, denom]) => {
    const swthToken = carbonTokens.find(d => d.denom === denom)!
    ret[chain] = swthToken
  })
  return ret
}

/**
 * Returns a readonly map of EVM Blockchains to their respective chain IDs
 * @param {Network} network The selected Zilliqa network based on wallet (mainnet/ testnet)
 */
export const getEvmChainIDs = (network: Network): ReadonlyMap<Blockchain, number> => {
  const mainnetChainIds: ReadonlyMap<Blockchain, number> = new Map<Blockchain, number>([
    [Blockchain.Ethereum, 1],
    [Blockchain.BinanceSmartChain, 56],
    [Blockchain.Arbitrum, 42161],
    [Blockchain.Polygon, 137],
  ])

  const testnetChainIds: ReadonlyMap<Blockchain, number> = new Map<Blockchain, number>([
    [Blockchain.Ethereum, 5],
    [Blockchain.BinanceSmartChain, 97],
    [Blockchain.Arbitrum, 421611],
    [Blockchain.Polygon, 80001],
  ])

  switch (network) {
    case Network.MainNet:
      return mainnetChainIds
    case Network.TestNet:
      return testnetChainIds
    default:
      return mainnetChainIds
  }
}

/**
 * This helper function allow us to check whether a chain with a superset type exists 
 * in the readonly array of bridgeable evm chains
 * @param {Blockchain} chain 
 * @returns {boolean} Whether inputted chain exists in the list of bridgeable EVM chains
 */
export const evmIncludes = (chain: Blockchain): chain is BridgeableEvmChains => {
  return BRIDGEABLE_EVM_CHAINS.includes(chain as BridgeableEvmChains)
}

/**
 * This helper function allow us to check whether a chain with a superset type exists 
 * in the readonly array of bridgeable chains
 * @param {Blockchain} chain 
 * @returns {boolean} Whether inputted chain exists in the list of bridgeable chains
 */
export const bridgeableIncludes = (chain: Blockchain): chain is BridgeableChains => {
  return BRIDGEABLE_CHAINS.includes(chain as BridgeableChains)
}

export const getRecoveryAddress = (network: CarbonSDK.Network) => {
  const mainDevRecoveryAddress = 'swth1cuekk8en9zgnuv0eh4hk7xtr2kghn69x0x6u7r'
  const localTestRecoveryAddress = 'tswth1cuekk8en9zgnuv0eh4hk7xtr2kghn69xt3tv8x'
  if (network === CarbonSDK.Network.MainNet || network === CarbonSDK.Network.DevNet) {
    return mainDevRecoveryAddress
  } else {
    return localTestRecoveryAddress
  }
}

export const getETHClient = (sdk: ConnectedCarbonSDK | CarbonSDK, chain: Blockchain, network: CarbonSDK.Network) => {
  if (network === CarbonSDK.Network.TestNet) {
    return sdk.eth
  } else if (evmIncludes(chain)) {
    return sdk[chain]
  } else {
    return sdk.eth
  }
}

export const getEvmGasLimit = (evmChain: Blockchain) => {
  switch (evmChain) {
    case Blockchain.Ethereum:
      return 250000
    case Blockchain.Arbitrum:
      return 2000000
    case Blockchain.BinanceSmartChain:
      return 200000
    default:
      return 250000
  }
}

export const getExplorerLink = (hash: string, network: Network, blockchain?: Blockchain) => {
  if (network === Network.MainNet) {
    switch (blockchain) {
      case Blockchain.Ethereum:
        return `https://etherscan.io/tx/${hash}`
      case Blockchain.Arbitrum:
        return `https://arbiscan.io/tx/${hash}`
      case Blockchain.BinanceSmartChain:
        return `https://bscscan.com/tx/${hash}`
      case Blockchain.Polygon:
        return `https://polygonscan.com/tx/${hash}`
      case Blockchain.Zilliqa: /* FALLTHROUGH */
      default:
        return `https://viewblock.io/zilliqa/tx/${hash}`
    }
  } else {
    switch (blockchain) {
      case Blockchain.Ethereum:
        return `https://goerli.etherscan.io/tx/${hash}`
      case Blockchain.Zilliqa: /* FALLTHROUGH */
      default:
        return `https://viewblock.io/zilliqa/tx/${hash}?network=testnet`
    }
  }
}

export const getExplorerSite = (network: Network, blockchain?: BridgeableChains): string => {
  if (network === Network.MainNet) {
    switch (blockchain) {
      case Blockchain.Ethereum:
        return 'Etherscan'
      case Blockchain.Arbitrum:
        return 'Arbiscan'
      case Blockchain.BinanceSmartChain:
        return 'Bscscan'
      case Blockchain.Polygon:
        return 'Polygonscan'
      case Blockchain.Zilliqa: /* FALLTHROUGH */
      default:
        return 'Viewblock'
    }
  } else {
    switch (blockchain) {
      case Blockchain.Ethereum:
        return 'Goerliscan'
      case Blockchain.Zilliqa: /* FALLTHROUGH */
      default:
        return 'Viewblock'
    }
  }
}

export const getChainParams = (network: Network) => {
  switch (network) {
    case Network.MainNet:
      return {
        [Blockchain.Ethereum]: {
          //TODO: sub with the correct values
          chainId: `0x${getEvmChainIDs(network).get(Blockchain.Ethereum)!.toString(16)}`,
          chainName: "Ethereum Network",
          rpcUrls: [EthRpcUrl[network][Blockchain.Ethereum]],
          blockExplorerUrls: ["https://etherscan.io"]
        },
        [Blockchain.Arbitrum]: {
          chainId: `0x${getEvmChainIDs(network).get(Blockchain.Arbitrum)!.toString(16)}`,
          chainName: "Arbitrum One",
          nativeCurrency: {
            name: "Ethereum (Arbitrum)",
            symbol: "ETH",
            decimals: 18
          },
          rpcUrls: [EthRpcUrl[network][Blockchain.Arbitrum]],
          blockExplorerUrls: ["https://explorer.arbitrum.io"]
        },
        [Blockchain.BinanceSmartChain]: {
          chainId: `0x${getEvmChainIDs(network).get(Blockchain.BinanceSmartChain)!.toString(16)}`,
          chainName: "Binance Smart Chain",
          nativeCurrency: {
            name: "Binance Chain Native Token",
            symbol: "BNB",
            decimals: 18
          },
          rpcUrls: [EthRpcUrl[network][Blockchain.BinanceSmartChain]],
          blockExplorerUrls: ["https://bscscan.com"]
        },
        [Blockchain.Polygon]: {
          chainId: `0x${getEvmChainIDs(network).get(Blockchain.Polygon)!.toString(16)}`,
          chainName: "Polygon Network",
          nativeCurrency: {
            name: "Polygon Matic Token",
            symbol: "MATIC",
            decimals: 18
          },
          rpcUrls: [EthRpcUrl[network][Blockchain.Polygon]],
          blockExplorerUrls: ["https://polygonscan.com"]
        },
      }
    case Network.TestNet:
      return {
        [Blockchain.Ethereum]: {
          chainId: `0x${getEvmChainIDs(network).get(Blockchain.Ethereum)!.toString(16)}`,
          chainName: "Goerli Test Network",
          RpcUrls: [EthRpcUrl[network][Blockchain.Ethereum]],
          blockExplorerUrls: ["https://goerli.etherscan.io"]
        },
        [Blockchain.Arbitrum]: {
          chainId: `0x${getEvmChainIDs(network).get(Blockchain.Arbitrum)!.toString(16)}`,
          chainName: "Arbitrum One (Testnet)",
          rpcUrls: [EthRpcUrl[network][Blockchain.Arbitrum]],
          blockExplorerUrls: ["https://testnet.arbiscan.io"]
        },
        [Blockchain.BinanceSmartChain]: {
          chainId: `0x${getEvmChainIDs(network).get(Blockchain.BinanceSmartChain)!.toString(16)}`,
          chainName: "Binance Smart Chain (Testnet)",
          nativeCurrency: {
            name: "Binance Chain Native Token",
            symbol: "BNB",
            decimals: 18
          },
          rpcUrls: [EthRpcUrl[network][Blockchain.BinanceSmartChain]],
          blockExplorerUrls: ["https://testnet.bscscan.com"]
        },
        [Blockchain.Polygon]: {
          chainId: `0x${getEvmChainIDs(network).get(Blockchain.Polygon)!.toString(16)}`,
          chainName: "Polygon Mumbai Testnet",
          nativeCurrency: {
            name: "Polygon Matic Token",
            symbol: "MATIC",
            decimals: 18
          },
          rpcUrls: [EthRpcUrl[network][Blockchain.Polygon]],
          blockExplorerUrls: ["https://mumbai.polygonscan.com"]
        },
      }
  }
}