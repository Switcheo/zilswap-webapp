import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";
import { SimpleMap } from "./types";

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
  BoltXConnected: "zilswap:boltx-connected",
  ZeevesConnected: "zilswap:zeeves-connected",
  Network: "zilswap:network",
  UserTokenList: "zilswap:user-token-list",
  PendingClaimedTxs: "zilswap:pending-claimed-txs",
  SwapSlippageExpiry: "zilswap:swap-slippage-expiry",
  BridgeTxs: 'zilswap:bridge-txs',
  ArkAccessToken: 'zilswap:ark-access-token',
};

export const PlaceholderStrings = {
  ZilAddress: "Enter ZIL address (e.g. zil…)",
  ZilTokenAddress: "Enter token address (e.g. zil…)",
};

export const ZilPayNetworkMap = {
  mainnet: Network.MainNet,
  testnet: Network.TestNet,
} as { [index: string]: Network };

export const BoltXNetworkMap = {
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

export const MAX_CLAIMS_PER_TX = 4;

export const STATS_REFRESH_RATE = 300000; // ms

export const BRIDGE_TX_DEPOSIT_CONFIRM_ZIL = 3;
export const BRIDGE_TX_DEPOSIT_CONFIRM_ETH = 12;

export const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ZIL_ADDRESS = "zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz";
export const ZIL_DECIMALS = 12;

export const BRIDGEABLE_WRAPPED_DENOMS = {
  [Network.MainNet]: ["zusdt.z.3", "zeth.z.1", "zwbtc.z.1"],
  [Network.TestNet]: ["zil5.e", "zwap5.e", "eth6.z", "dai6.z"],
}

export const TOKEN_SYMBOLS = {
  "ZETH": "zETH",
  "ZWBTC": "zWBTC",
  "ZUSDT": "zUSDT",
} as SimpleMap<string>;

export const TRANSAK_API_KEY = {
  DEVELOPMENT: process.env.REACT_APP_TRANSAK_DEV,
  PRODUCTION: process.env.REACT_APP_TRANSAK_PROD,
}

// ms
export class PollIntervals {
  public static TokenState = 30000;

  public static USDRates = 10000;

  public static Distributors = 60000;

  public static RetryAfterError = 5000;

  public static BridgeDepositWatcher = 10000;
  public static BridgeWithdrawWatcher = 10000;
  public static BridgeTokenFee = 60000;
}

// eslint-disable-next-line 
export const EmailRegex = /(?!.*\.{2})^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i