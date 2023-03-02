import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";
import { SimpleMap } from "./types";

export const DefaultFallbackNetwork = Network.MainNet;

export const BRIDGE_DISABLED = false;

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
  MintContracts: 'zilswap:mint-contracts',
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

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ZIL_ADDRESS = "zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz";
export const ZIL_DECIMALS = 12;

export const TOKEN_NAME_OVERRIDE: SimpleMap<string> = {
  // Legacy XCAD Network token
  "zil1h63h5rlg7avatnlzhfnfzwn8vfspwkapzdy2aw": "XCAD (Legacy)",
}

export const HIDE_SWAP_TOKEN_OVERRIDE: string[] = [
  "zil14jmjrkvfcz2uvj3y69kl6gas34ecuf2j5ggmye",
]

export const WZIL_TOKEN_CONTRACT = {
  [Network.MainNet]: "zil1gvr0jgwfsfmxsyx0xsnhtlte4gks6r3yk8x5fn",
  [Network.TestNet]: "zil1nzn3k336xwal7egdzgalqnclxtgu3dggxed85m",
}

export const BRIDGEABLE_WRAPPED_DENOMS = {
  [Network.MainNet]: [
    "zusdt.1.18.1728e9", "zeth.1.18.54437c", "zwbtc.1.18.a9cb60",
    "zxcad.1.18.35137d", "eport.1.2.7d4912", "efees.1.2.586fb5",
    "elunr.1.2.e2121e", "ezil.1.2.f1b7e4", "dxcad.1.2.67dde7",
    "zbrkl.1.18.b8c24f", "zopul.1.18.4bcdc9", "ztraxx.1.18.9c8e35",
  ],
  [Network.TestNet]: ["zeth.1.111.eaa57f", "zdai.1.111.f9a752", "zwap.0.111.227030", "zil.0.2.6b2a39"],
}

export const ERC20_ZIL_TOKENSWAP_CONTRACT = {
  [Network.MainNet]: "0xef1efb7f22fb728820d4952b33012a7115e87687",
  [Network.TestNet]: "0xa5E6e035daa1B85383f36f36D22562F552591df9",
}

export const ERC20_LEGACY_ZIL_CONTRACT = {
  [Network.MainNet]: "0x05f4a42e251f2d52b8ed15e9fedaacfcef1fad27",
  [Network.TestNet]: "0x2024cb47191db8a8f2961a9d9dff9e11999fe8c7",
}

export const ERC20_BRIDGEABLE_ZIL_CONTRACT = {
  [Network.MainNet]: "0x6eeb539d662bb971a4a01211c67cb7f65b09b802",
  [Network.TestNet]: "0x92774e23edaa2927f3938ab4b690c076095cda0a",
}

export const TBM_CONTRACT =  {
  [Network.MainNet]: "0xd793f378a925b9f0d3c4b6ee544d31c707899386",
  [Network.TestNet]: "0xc948942f55ef05a95a46bb58ee9b0a67b0f871fa",
}

export const METAZOA_CONTRACT =  {
  [Network.MainNet]: "0xf79a456a5afd412d3890e2232f6205f664be8957",
  [Network.TestNet]: "0x48161750bab73620b23c287925bd229093d8b72e",
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

  public static MintPollStatus = 5000;
}

export const COLLECTION_NFT_PER_PAGE = 36;

export const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
export const USERNAME_REGEX = /^[A-Za-z0-9_]{1,20}$/
export const TWITTER_REGEX = /^[A-Za-z0-9_]{1,15}$/
export const INSTAGRAM_REGEX = /^[A-Za-z0-9_]{1,30}$/

export const REPORT_LEVEL_DEFAULT= 0;
export const REPORT_LEVEL_WARNING = 1;
export const REPORT_LEVEL_SUSPICIOUS = 2;

export const METAZOA_STAT: SimpleMap<string> = {
  "STR": "Strength",
  "INT": "Intellect",
  "DEX": "Dexterity",
  "LUK": "Luck",
  "SPD": "Speed",
  "END": "Endurance",
  "ACC": "Accuracy",
}

export const METAZOA_STAT_PROFESSION: SimpleMap<string> = {
  "STR": "Marauder",
  "DEX": "Astrominer",
  "INT": "Psionic",
}
