import { EpochInfo } from "core/utilities";
import moment from "moment";
import { ActionTypes } from "./actions";
import { RewardsState } from "./types";


const initial_state: RewardsState = {
  epochInfo: null,
};

const reducer = (state: RewardsState = initial_state, actions: any) => {
  switch (actions.type) {
    case ActionTypes.UPDATE_EPOCH_INFO:
      const info = actions.info as EpochInfo;
      return {
        ...state,
        epochInfo: {
          current: info.current_epoch,
          epochStart: moment.unix(info.epoch_start),
          nextEpoch: moment.unix(info.next_epoch),
          maxEpoch: info.max_epoch,
          raw: info,
        },
      };
    default:
      return state;
  };
}

export default reducer;
