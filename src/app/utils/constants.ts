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
    "initChain",
  ],
};

export const LocalStorageKeys = {
  PrivateKey: "zilswap:private-key",
  ZilPayConnected: "zilswap:zilpay-connected",
  ZeevesConnected: "zilswap:zeeves-connected",
  Network: "zilswap:network",
  UserTokenList: "zilswap:user-token-list",
  PendingClaimedTxs: "zilswap:pending-claimed-txs",
  SwapSlippageExpiry: "zilswap:swap-slippage-expiry",
  BridgeTxs: 'zilswap:bridge-txs',
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
  [Network.MainNet]: 'https://api.zilliqa.com',
  [Network.TestNet]: 'https://dev-api.zilliqa.com',
};

export const BIG_ZERO = new BigNumber(0);
export const BIG_ONE = new BigNumber(1);

export const PRODUCTION_HOSTS = [
  "zilswap.io",
  "www.zilswap.io",
  "zilswap.exchange",
  "www.zilswap.exchange",
];

export const isProduction = () => {
  return PRODUCTION_HOSTS.includes(window.location.hostname)
}

export const DEFAULT_TX_SLIPPAGE = 0.01;
export const DEFAULT_TX_EXPIRY = 3;

export const STATS_REFRESH_RATE = 30000; // ms

export const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ZIL_ADDRESS = "zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz";
export const ZWAP_ADDRESS = "zil1p5suryq6q647usxczale29cu3336hhp376c627";
export const ZIL_DECIMALS = 12;

export const TRANSAK_API_KEY = {
  DEVELOPMENT: process.env.REACT_APP_TRANSAK_DEV,
  PRODUCTION: process.env.REACT_APP_TRANSAK_PROD,
}

// ms
export class PollIntervals {
  public static TokenState = 30000;

  public static USDRates = 10000;

  public static ZWAPClaimHistory = 60000;
  public static EpochInfo = 60000;
  public static PoolWeights = 3600000;

  public static RetryAfterError = 5000;

  public static BridgeDepositWatcher = 10000;
  public static BridgeWithdrawWatcher = 10000;
}
