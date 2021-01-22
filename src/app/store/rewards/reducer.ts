import { SimpleMap } from "app/utils";
import { EpochInfo } from "core/utilities";
import moment from "moment";
import { RewardsActionTypes } from "./actions";
import { PoolZWAPReward, RewardsState } from "./types";


const initial_state: RewardsState = {
  epochInfo: null,
  rewardByPools: {},
};

const reducer = (state: RewardsState = initial_state, actions: any) => {
  switch (actions.type) {
    case RewardsActionTypes.UPDATE_EPOCH_INFO:
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
    case RewardsActionTypes.UPDATE_ZWAP_REWARDS:
      const rewardByPools = actions.rewards as SimpleMap<PoolZWAPReward>
      return {
        ...state,
        rewardByPools,
      };
    default:
      return state;
  };
}

export default reducer;
