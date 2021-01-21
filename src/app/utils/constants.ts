import { TokenInfo } from "app/store/types";
import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";

export const DefaultFallbackNetwork = Network.MainNet;

export type PageType = "pool" | "swap";
export const LoadingKeys = {
  connectWallet: [
    "connectWallet",
    "connectWalletZilPay",
    "connectWalletPrivateKey",
    "initWallet",
  ],
};

export const LocalStorageKeys = {
  PrivateKey: "zilswap:private-key",
  ZilPayConnected: "zilswap:zilpay-connected",
  Network: "zilswap:network",
};

export const PlaceholderStrings = {
  ZilAddress: "Enter ZIL address (e.g. zil…)",
  ZilTokenAddress: "Enter token address (e.g. zil…)",
};

export const ZilPayNetworkMap = {
  mainnet: Network.MainNet,
  testnet: Network.TestNet,
} as { [index: string]: Network };

export const BIG_ZERO = new BigNumber(0);
export const BIG_ONE = new BigNumber(1);

export const sortTokens = (lhs: TokenInfo, rhs: TokenInfo) => {
  const { listPriority: lhsPriority = Number.MAX_SAFE_INTEGER } = lhs;
  const { listPriority: rhsPriority = Number.MAX_SAFE_INTEGER } = rhs;
  return lhsPriority - rhsPriority;
};

export const PRICE_REFRESH_RATE = 10000; // ms
export const STATS_REFRESH_RATE = 5000; // ms

export const ZIL_TOKEN_NAME = "zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz";

// to be replaced with API
export const POOL_WEIGHTS = {
  "zil14pzuzq6v6pmmmrfjhczywguu0e97djepxt8g3e": 2,
  "zil1zu72vac254htqpg3mtywdcfm84l3dfd9qzww8t": 3,
  "zilzwap": 5,
} as { [address: string]: number };
export const TOTAL_POOL_WEIGHTS = Object.values(POOL_WEIGHTS).reduce((sum, weight) => sum + weight, 0);

export const ZWAP_REWARDS_PER_EPOCH = new BigNumber(6250);
