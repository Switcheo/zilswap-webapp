import { PreferenceState } from "./preference/types";
import { LayoutState } from "./layout/types";
import { WalletState } from "./wallet/types";
import { SwapFormState } from "./swap/types";
import { PoolFormState } from "./pool/types";

export interface RootState {
  preference: PreferenceState;
  layout: LayoutState;
  wallet: WalletState;
  swap: SwapFormState;
  pool: PoolFormState;
};