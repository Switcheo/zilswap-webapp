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
  ArkBuyAcceptTerms: 'zilswap:ark-buy-accept-terms',
  ArkBidAcceptTerms: 'zilswap:ark-bid-accept-terms',
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

export const TOKEN_NAME_OVERRIDE: SimpleMap<string> = {
  // Legacy XCAD Network token
  "zil1h63h5rlg7avatnlzhfnfzwn8vfspwkapzdy2aw": "XCAD (Legacy)",
}

export const WZIL_TOKEN_CONTRACT = {
  [Network.MainNet]: "zil1gvr0jgwfsfmxsyx0xsnhtlte4gks6r3yk8x5fn",
  [Network.TestNet]: "zil1nzn3k336xwal7egdzgalqnclxtgu3dggxed85m",
}

export const BRIDGEABLE_WRAPPED_DENOMS = {
  [Network.MainNet]: ["zusdt.z.3", "zeth.z.1", "zwbtc.z.1", "xcad.z.1", "port.e.1", "fees.e.1", "lunr.e.1"],
  [Network.TestNet]: ["zil5.e", "zwap5.e", "eth6.z", "dai6.z"],
}

export const ERC20_TOKENSWAP_CONTRACT = {
  [Network.MainNet]: "",
  [Network.TestNet]: "0xa5E6e035daa1B85383f36f36D22562F552591df9",
}

export const LEGACY_ZIL_CONTRACT = {
  [Network.MainNet]: "",
  [Network.TestNet]: "0x2024cb47191db8a8f2961a9d9dff9e11999fe8c7",
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

export const TIME_UNIX_PAIRS: { [interval: string]: number } = {
  'hour': 3600,
  'day': 86400,
  'week': 604800,
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

export const COLLECTION_NFT_PER_PAGE = 36;

export const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
export const USERNAME_REGEX = /^[A-Za-z0-9_]{1,19}$/
export const TWITTER_REGEX = /^[A-Za-z0-9_]{1,14}$/
export const INSTAGRAM_REGEX = /^[A-Za-z0-9_]{1,29}$/
