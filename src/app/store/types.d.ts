import { PreferenceState } from "./preference/types";
import { LayoutState } from "./layout/types";
import { WalletState } from "./wallet/types";
import { TokenState } from "./token/types";
import { SwapFormState } from "./swap/types";
import { PoolFormState } from "./pool/types";
import { TransactionState } from "./transaction/types";

export * from "./preference/types";
export * from "./layout/types";
export * from "./wallet/types";
export * from "./token/types";
export * from "./swap/types";
export * from "./pool/types";
export * from "./transaction/types";

export interface RootState {
  transaction: TransactionState;
  preference: PreferenceState;
  layout: LayoutState;
  wallet: WalletState;
  token: TokenState;
  swap: SwapFormState;
  pool: PoolFormState;
};