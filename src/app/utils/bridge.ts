import { Blockchain, CarbonSDK } from 'carbon-js-sdk'
import { Token } from 'carbon-js-sdk/lib/codec'
import { SimpleMap } from 'carbon-js-sdk/lib/util/type'

export const getTokenDenomList = (network: CarbonSDK.Network) => {
    const mainTokenDenoms: SimpleMap<string> = {
        [Blockchain.Ethereum]: "swthe.1.2.683ddd",
        [Blockchain.BinanceSmartChain]: "swth.1.6.5bc06b",
        [Blockchain.Carbon]: "swth",
        [Blockchain.Zilliqa]: "swth.1.18.4ef38b",
        [Blockchain.Neo]: "swthn.1.4.2624e1",
        [Blockchain.Neo3]: "swth.1.14.fffdbf",
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

export const getTokenDenoms = (network: CarbonSDK.Network, chain: Blockchain) => {
  return getTokenDenomList(network)[chain]
}

export const getSwthBridgeTokens = async (network: CarbonSDK.Network) => {
  var ret: SimpleMap<Token> = {}
  const carbonSdk: CarbonSDK = await CarbonSDK.instance({network})
  const carbonTokens: Token[] = Object.values(carbonSdk.token.tokens);
  const swthBridgeDenoms = getTokenDenomList(network)
  Object.entries(swthBridgeDenoms).forEach(([chain, denom]) => {
    const swthToken = carbonTokens.find(d => d.denom === denom)!;
    ret[chain] = swthToken
  })
  return ret
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