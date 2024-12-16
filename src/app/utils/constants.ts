import BigNumber from "bignumber.js";
import { Blockchain } from 'carbon-js-sdk/lib'
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

export const EthRpcUrl = {
  [Network.MainNet]: {
    [Blockchain.Ethereum]: "https://eth-mainnet.alchemyapi.io/v2/RWHcfoaBKzRpXnLONcEDnVqtUp7StNYl",
    [Blockchain.Arbitrum]: "https://arb1.arbitrum.io/rpc",
    [Blockchain.BinanceSmartChain]: "https://bsc-dataseed1.binance.org",
    [Blockchain.Polygon]: "https://polygon-rpc.com",
  },
  [Network.TestNet]: {
    [Blockchain.Ethereum]: "https://eth-goerli.alchemyapi.io/v2/Rog1kuZQf1R8X7EAmsXs7oFyQXyzIH-4",
    [Blockchain.Arbitrum]: "https://rinkeby.arbitrum.io/rpc",
    [Blockchain.BinanceSmartChain]: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    [Blockchain.Polygon]: "https://rpc-mumbai.maticvigil.com",
  },
}

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

export const DISABLE_ZILBRIDGE = false;

export const ZILBRIDGE_BLACKLIST_DENOMS = ['bnb.1.6.773edb', 'zbnb.1.18.c406be'];

export const DEFAULT_TX_SLIPPAGE = 0.01;
export const DEFAULT_TX_EXPIRY = 3;

export const MAX_CLAIMS_PER_TX = 4;

export const STATS_REFRESH_RATE = 300000; // ms

export const BRIDGE_TX_DEPOSIT_CONFIRM_ZIL = 3;
export const BRIDGE_TX_DEPOSIT_CONFIRM_ETH = 12;

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ZIL_ADDRESS = "zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz";
export const ZIL_DECIMALS = 12;
export const ZWAP_DISTRIBUTOR_HEX = "0xea57c6b7b5475107688bc70aabefdd5352d0bed0";

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
    "swth.1.19.6f83d0", "swth.1.6.5bc06b", "swth.1.18.4ef38b",
    "swth.1.17.dbb4d5", "zbnb.1.18.c406be", "zil.1.17.3997a2",
    "zil.1.19.0f16f8", "zil.1.6.52c256", "zmatic.1.18.45185c"
  ],
  [Network.TestNet]: ["swth.1.111.ae86f6", "swth.1.502.976cb7"],
}

//To edit when integrating new EVM chains for Zilbridge
export const BRIDGEABLE_EVM_CHAINS = [
  Blockchain.Ethereum,
  Blockchain.Arbitrum,
  Blockchain.BinanceSmartChain,
  Blockchain.Polygon
] as const

export const BRIDGE_CHAINS_WITH_NATIVE_ZERO_TOKEN = [
  Blockchain.Ethereum,
  Blockchain.BinanceSmartChain,
  Blockchain.Polygon
] as const

export const CHAIN_NAMES = {
  [Blockchain.Zilliqa]: 'Zilliqa',
  [Blockchain.Ethereum]: 'Ethereum',
  [Blockchain.Neo]: 'Neo',
  [Blockchain.BinanceSmartChain]: 'Binance Smart Chain',
  [Blockchain.Arbitrum]: 'Arbitrum One',
  [Blockchain.Polygon]: 'Polygon',
}

//To edit when integrating other blockchain protocols to Zilbridge
export const BRIDGEABLE_CHAINS = [
  Blockchain.Zilliqa,
  ...BRIDGEABLE_EVM_CHAINS
] as const

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

export const TBM_CONTRACT = {
  [Network.MainNet]: "0xd793f378a925b9f0d3c4b6ee544d31c707899386",
  [Network.TestNet]: "0xc948942f55ef05a95a46bb58ee9b0a67b0f871fa",
}

export const METAZOA_CONTRACT = {
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

export const REPORT_LEVEL_DEFAULT = 0;
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

const ERC20_ABI = [
  // Some details about the token
  "function name() view returns (string)",
  "function symbol() view returns (string)",

  // Get the account balance
  "function balanceOf(address) view returns (uint)",

  "function allowance(address owner, address spender) view returns (uint)",

  // Send some of your tokens to someone else
  "function transfer(address to, uint amount)",

  "function approve(address spender, uint amount)",

  // An event triggered whenever anyone transfers to someone else
  "event Transfer(address indexed from, address indexed to, uint amount)"
];

export const EthContractABIs: { [key: string]: string[] | null } = {
  [Network.MainNet]: ERC20_ABI,
  [Network.TestNet]: ERC20_ABI,
}
