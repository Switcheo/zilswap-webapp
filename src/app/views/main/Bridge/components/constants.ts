export enum ChainTransferFlow {
    ZIL_TO_ETH = "zil_to_eth",
    ETH_TO_ZIL = "eth_to_zil",
}

export const BridgeParamConstants = {
    TEMP_SWTH_MNEMONIC: process.env.REACT_APP_BRIDGE_TEMP_SWTH_MNEMONIC,
    SWTH_FEE_ADDRESS: "swth1prv0t8j8tqcdngdmjlt59pwy6dxxmtqgycy2h7",
    ZIL_GAS_PRICE: 2000000000,
    ZIL_GAS_LIMIT: 25000,
    ETH_GAS_LIMIT: 250000,
    ARBITRUM_GAS_LIMIT: 2000000,
    DEPOSIT_DENOM: "usdt.z",      //zil1 , zil9
    WITHDRAW_DENOM: "usdt.z",   //zil.e, zil9.e
    TRANSFER_FLOW: ChainTransferFlow.ZIL_TO_ETH,
}

export const swthTokenAddress = "zil1yk93f957fanapf0yszgm84p62xrxxfytj4d2tl"