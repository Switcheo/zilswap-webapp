import dayjs from "dayjs";
import { LayoutActionTypes } from "./actions";
import { LayoutState } from "./types";

const initial_state: LayoutState = {
  showWalletDialog: false,
  showCreatePool: false,
  liquidityEarnHidden: false,
  notification: undefined,
  showPoolType: "add",
  loadingTasks: {},
  tasksRegistry: {},
};

const reducer = (state: LayoutState = initial_state, actions: any) => {
  let loadingTask = null, taskName;
  switch (actions.type) {
    case LayoutActionTypes.TOGGLE_SHOW_WALLET:
      return {
        ...state,
        showWalletDialog: !actions.override ? !state.showWalletDialog : actions.override === "open",
      };
    case LayoutActionTypes.SHOW_POOL_TYPE:
      return {
        ...state,
        showPoolType: actions.poolType,
      };
    case LayoutActionTypes.TOGGLE_SHOW_CREATE_POOL:
      return {
        ...state,
        showCreatePool: !actions.override ? !state.showWalletDialog : actions.override === "open",
      };

    case LayoutActionTypes.HIDE_LIQUIDITY_EARN:
      return {
        ...state,
        liquidityEarnHidden: actions.hide === undefined ? true : actions.hide,
      };

    case LayoutActionTypes.ADD_BACKGROUND_LOADING:
      return {
        ...state,
        loadingTasks: {
          ...state.loadingTasks,
          [actions.name]: {
            ...(state.loadingTasks[actions.name] || {}),
            [actions.uuid]: dayjs(),
          },
        },
        tasksRegistry: {
          ...state.tasksRegistry,
          [actions.uuid]: actions.name,
        },
      };
    case LayoutActionTypes.REMOVE_BACKGROUND_LOADING:
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
