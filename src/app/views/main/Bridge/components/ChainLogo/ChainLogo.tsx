import React from 'react'
import { Blockchain } from 'carbon-js-sdk/lib'
import { BridgeableChains } from 'app/store/types'
import { ReactComponent as ArbitrumLogo } from "../../bridgeAssets/arbitrum-one.svg"
import { ReactComponent as EthereumLogo } from "../../bridgeAssets/ethereum-logo.svg"
import { ReactComponent as ZilliqaLogo } from "../../bridgeAssets/zilliqa-logo.svg"
import { ReactComponent as BSCLogo } from "../../bridgeAssets/bsc-logo.svg"

interface Props {
    chain: BridgeableChains
    style?: any
}

const ChainLogo: React.FC<Props> = (props: Props) => {
    const { chain, style } = props
    const renderLogo = () => {
        switch (chain) {
            case Blockchain.Ethereum: return <EthereumLogo className={style} />
            case Blockchain.Arbitrum: return <ArbitrumLogo className={style} />
            case Blockchain.Zilliqa: return <ZilliqaLogo className={style} />
            case Blockchain.BinanceSmartChain: return <BSCLogo className={style} />
            default: return <ZilliqaLogo />
        }
    }
    return (
        <>
            {
                renderLogo()
            }
        </>
    )
}

export default ChainLogo