import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";

export const DIST_CONTRACT = {
  [Network.MainNet]: "zil1efkn743p324gnnfqgpk0y2hwy6ag7cyfephyjt",
  [Network.TestNet]: "zil187a9fqhytxhge3s3g06aeglnk389ncrmenfr7t",
}
export const TOKEN_CONTRACT = {
  [Network.MainNet]: "zil1p5suryq6q647usxczale29cu3336hhp376c627",
  [Network.TestNet]: "zil1k2c3ncjfduj9jrhlgx03t2smd6p25ur56cfzgz",
}

export const RETROACTIVE_AIRDROP_FACTOR = 0.05;
export const TOTAL_SUPPLY = new BigNumber(1000000).shiftedBy(12);
