import { BlockchainState } from "./blockchain/types";
import { BridgeState } from "./bridge/types";
import { LayoutState } from "./layout/types";
import { PoolFormState } from "./pool/types";
import { PreferenceState } from "./preference/types";
import { RewardsState } from "./rewards/types";
import { StatsState } from "./stats/types";
import { SwapFormState } from "./swap/types";
import { TokenState } from "./token/types";
import { TransactionState } from "./transaction/types";
import { WalletState } from "./wallet/types";

export * from "./blockchain/types";
export * from "./bridge/types";
export * from "./layout/types";
export * from "./pool/types";
export * from "./preference/types";
export * from "./rewards/types";
export * from "./stats/types";
export * from "./swap/types";
export * from "./token/types";
export * from "./transaction/types";
export * from "./wallet/types";

export interface RootState {
  blockchain: BlockchainState
  bridge: BridgeState;
  transaction: TransactionState;
  preference: PreferenceState;
  layout: LayoutState;
  wallet: WalletState;
  token: TokenState;
  stats: StatsState;
  swap: SwapFormState;
  pool: PoolFormState;
  rewards: RewardsState;
};
