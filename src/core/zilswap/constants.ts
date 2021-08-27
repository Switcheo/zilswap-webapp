import { Network } from "zilswap-sdk/lib/constants";

export const REWARDS_DISTRIBUTOR_CONTRACT = {
  [Network.MainNet]: "zil1efkn743p324gnnfqgpk0y2hwy6ag7cyfephyjt",
  [Network.TestNet]: "zil187a9fqhytxhge3s3g06aeglnk389ncrmenfr7t",
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
