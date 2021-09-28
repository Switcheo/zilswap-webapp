import { Network } from "zilswap-sdk/lib/constants";

export const REWARDS_DISTRIBUTOR_CONTRACT = {
  [Network.MainNet]: "zil17vn9jep2s2ajqf694tygg83nrv6nmyqjja8t85",
  [Network.TestNet]: "zil1p3en4rzqcfuntf8fh6tr7j6wy5qs4utwck0d38",
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
