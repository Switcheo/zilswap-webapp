import { RootState } from "app/store/types";

export const getBlockchain = (state: RootState) => state.blockchain
export const getTransactions = (state: RootState) => state.transaction
export const getWallet = (state: RootState) => state.wallet
export const getRewards = (state: RootState) => state.rewards
export const getTokens = (state: RootState) => state.token
export const getBridge = (state: RootState) => state.bridge
export const getMarketplace = (state: RootState) => state.marketplace
export const getMint = (state: RootState) => state.mint
export const getCarbonSDK = (state: RootState) => state.carbonSDK.sdkCache
