import { DefaultFallbackNetwork, LocalStorageKeys } from "app/utils/constants";
import moment from "moment";
import { Network } from "zilswap-sdk/lib/constants";
import { ActionTypes } from "./actions";
import { LayoutState } from "./types";

const storedNetworkString = localStorage.getItem(LocalStorageKeys.Network);
const networks: { [index: string]: Network | undefined } = Network;
const storedNetwork = networks[storedNetworkString || ""] || DefaultFallbackNetwork;

const initial_state: LayoutState = {
  showWalletDialog: false,
  showCreatePool: false,
  liquidityEarnHidden: false,
  notification: undefined,
  network: storedNetwork,
  showPoolType: "add",
  loadingTasks: {},
  tasksRegistry: {},
};

const reducer = (state: LayoutState = initial_state, actions: any) => {
  let loadingTask = null, taskName;
  switch (actions.type) {
    case ActionTypes.TOGGLE_SHOW_WALLET:
      return {
        ...state,
        showWalletDialog: !actions.override ? !state.showWalletDialog : actions.override === "open",
      };
    case ActionTypes.SHOW_POOL_TYPE:
      return {
        ...state,
        showPoolType: actions.poolType,
      };
    case ActionTypes.TOGGLE_SHOW_CREATE_POOL:
      return {
        ...state,
        showCreatePool: !actions.override ? !state.showWalletDialog : actions.override === "open",
      };

    case ActionTypes.HIDE_LIQUIDITY_EARN:
      return {
        ...state,
        liquidityEarnHidden: actions.hide === undefined ? true : actions.hide,
      };

    case ActionTypes.UPDATE_NETWORK:
      localStorage.setItem(LocalStorageKeys.Network, actions.network);
      return {
        ...state,
        network: actions.network,
      };

    case ActionTypes.ADD_BACKGROUND_LOADING:
      loadingTask = state.loadingTasks[actions.name] || {};
      loadingTask[actions.uuid] = moment();
      state.tasksRegistry[actions.uuid] = actions.name;
      return {
        ...state,
        loadingTasks: {
          ...state.loadingTasks,
          [actions.name]: loadingTask,
        },
        tasksRegistry: {
          ...state.tasksRegistry,
        },
      };
    case ActionTypes.REMOVE_BACKGROUND_LOADING:
      taskName = state.tasksRegistry[actions.uuid];
      if (!taskName)
        return state;
      loadingTask = state.loadingTasks[taskName];
      if (!loadingTask || !loadingTask[actions.uuid])
        return state;

      delete loadingTask[actions.uuid];
      if (!Object.keys(loadingTask).length)
        delete state.loadingTasks[taskName];
      delete state.tasksRegistry[actions.uuid];
      return {
        ...state,
        loadingTasks: {
          ...state.loadingTasks,
        },
        tasksRegistry: {
          ...state.tasksRegistry,
        },
      };
    default:
      return state;
  };
}

export default reducer;
