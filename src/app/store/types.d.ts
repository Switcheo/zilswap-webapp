import { PreferenceState } from "./preference/types";
import { LayoutState } from "./layout/types";

export interface RootState {
  preference: PreferenceState;
  layout: LayoutState;
};