import { Network } from "zilswap-sdk/lib/constants";

export const REWARDS_DISTRIBUTOR_CONTRACT = {
  [Network.MainNet]: "zil1x9sgg50evk67le33ntcwzj7xuj7x69rlh9lzsc",
  [Network.TestNet]: "zil1clfx0r4ks4gfyxrz4u98p9srmmq7lwtx9uh0jh",
}

export const ZWAP_TOKEN_CONTRACT = {
  [Network.MainNet]: "zil1p5suryq6q647usxczale29cu3336hhp376c627",
  [Network.TestNet]: "zil1k2c3ncjfduj9jrhlgx03t2smd6p25ur56cfzgz",
}

export const CHAIN_IDS = {
  [Network.TestNet]: 333, // chainId of the developer testnet
  [Network.MainNet]: 1, // chainId of the mainnet
}

export const MSG_VERSION = 1; // current msgVersion
