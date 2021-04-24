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
  ZeevesConnected: "zilswap:zeeves-connected",
  Network: "zilswap:network",
  UserTokenList: "zilswap:user-token-list",
};

export const PlaceholderStrings = {
  ZilAddress: "Enter ZIL address (e.g. zil…)",
  ZilTokenAddress: "Enter token address (e.g. zil…)",
};

export const ZilPayNetworkMap = {
  mainnet: Network.MainNet,
  testnet: Network.TestNet,
} as { [index: string]: Network };

export const ZeevesNetworkMap = {
  mainnet: Network.MainNet,
} as { [index: string]: Network };

export const RPCEndpoints: { [key in Network]: string } = {
  [Network.MainNet]: 'https://api2.zilliqa.com',
  [Network.TestNet]: 'https://dev-api.zilliqa.com'
};

export const BIG_ZERO = new BigNumber(0);
export const BIG_ONE = new BigNumber(1);

export const sortTokens = (lhs: TokenInfo, rhs: TokenInfo) => {
  const { listPriority: lhsPriority = Number.MAX_SAFE_INTEGER } = lhs;
  const { listPriority: rhsPriority = Number.MAX_SAFE_INTEGER } = rhs;
  return lhsPriority - rhsPriority;
};

export const PRODUCTION_HOSTS = [
  "zilswap.io",
  "www.zilswap.io",
  "zilswap.exchange",
  "www.zilswap.exchange",
];

export const STATS_REFRESH_RATE = 30000; // ms

export const ZIL_TOKEN_NAME = "zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz";
export const ZIL_DECIMALS = 12;

// ms
export class PollIntervals {
  public static USDRates = 10000;

  public static ZWAPClaimHistory = 60000;
  public static EpochInfo = 60000;
  public static PoolWeights = 3600000;
}
