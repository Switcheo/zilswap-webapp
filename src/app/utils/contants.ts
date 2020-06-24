import { TokenInfo } from "app/store/types";
import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";

export const DefaultFallbackNetwork = Network.TestNet;

export const LoadingKeys = {
  connectWallet: [
    "connectWallet",
    "connectWalletMoonlet",
    "connectWalletPrivateKey",
    "initWallet",
  ],
};

export const LocalStorageKeys = {
  PrivateKey: "zilswap:private-key",
  ZilPayConnected: "zilswap:zilpay-connected",
};

export const BIG_ZERO = new BigNumber(0);
export const BIG_ONE = new BigNumber(1);

export const sortTokens = (lhs: TokenInfo, rhs: TokenInfo) => {
  const { listPriority: lhsPriority = Number.MAX_SAFE_INTEGER } = lhs;
  const { listPriority: rhsPriority = Number.MAX_SAFE_INTEGER } = rhs;
  return lhsPriority - rhsPriority;
};

export const ZIL_TOKEN_NAME =  "zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz";