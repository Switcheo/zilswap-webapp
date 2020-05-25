import BigNumber from "bignumber.js";
import { TokenInfo } from "app/store/types";

export const LoadingKeys = {
  connectWallet: [
    "connectWallet",
    "connectWalletMoonlet",
    "connectWalletPrivateKey",
  ],
};


export const BIG_ZERO = new BigNumber(0);
export const BIG_ONE = new BigNumber(1);

export const sortTokens = (lhs: TokenInfo, rhs: TokenInfo) => {
  const { listPriority: lhsPriority = Number.MAX_SAFE_INTEGER } = lhs;
  const { listPriority: rhsPriority = Number.MAX_SAFE_INTEGER } = rhs;
  return lhsPriority - rhsPriority;
};

export const ZIL_TOKEN_NAME =  "zil";