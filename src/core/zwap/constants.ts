import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";

export const DIST_CONTRACT = {
  [Network.MainNet]: "zil1v79u3zflpxs57u9kmrj9ygry6kgafnakm44zlv",
  [Network.TestNet]: "zil187a9fqhytxhge3s3g06aeglnk389ncrmenfr7t",
}
export const TOKEN_CONTRACT = {
  [Network.MainNet]: "zil1v9wguye09y7kkvthez5f6aftk8ln8vg8am0wvq",
  [Network.TestNet]: "zil1ktmx2udqc77eqq0mdjn8kqdvwjf9q5zvy6x7vu",
}

export const RETROACTIVE_AIRDROP_FACTOR = 0.05;
export const TOTAL_SUPPLY = new BigNumber(1000000).shiftedBy(12);
