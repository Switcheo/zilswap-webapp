import { TYPES } from "./actions";
import { PreferenceState } from "./types";

const initial_state: PreferenceState = {
  theme: "light",
};

const reducer = (state: PreferenceState = initial_state, actions: any) => {
  switch (actions.type) {
    case TYPES.INIT:
      return {
        ...state,
        ...actions.payload,
      };
    case TYPES.UPDATE:
      return {
        ...state,
        ...actions.payload,
      };
    default:
      return state;
  };


}

export default reducer;
