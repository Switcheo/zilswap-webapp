import dayjs from "dayjs";
import { LayoutActionTypes } from "./actions";
import { LayoutState } from "./types";

const initial_state: LayoutState = {
  showWalletDialog: false,
  showCreatePool: false,
  showAdvancedSetting: false,
  showTransactionDialog: false,
  showTransferConfirmation: false,
  liquidityEarnHidden: false,
  notification: undefined,
  showPoolType: "add",
  loadingTasks: {},
  tasksRegistry: {},
};

const reducer = (state: LayoutState = initial_state, action: any) => {
  let loadingTask = null, taskName;
  switch (action.type) {
    case LayoutActionTypes.TOGGLE_SHOW_WALLET:
      return {
        ...state,
        showWalletDialog: !action.override ? !state.showWalletDialog : action.override === "open",
      };
    case LayoutActionTypes.SHOW_POOL_TYPE:
      return {
        ...state,
        showPoolType: action.poolType,
      };
    case LayoutActionTypes.SHOW_ADVANCED_SETTING:
      return {
        ...state,
        showAdvancedSetting: action.show,
      };
    case LayoutActionTypes.SHOW_TRANSFER_CONFIRMATION:
      return {
        ...state,
        showTransferConfirmation: action.show,
      };
    case LayoutActionTypes.TOGGLE_SHOW_TRANSACTIONS:
      return {
        ...state,
        showTransactionDialog: !action.override ? !state.showTransactionDialog : action.override === "open",
      };
    case LayoutActionTypes.TOGGLE_SHOW_CREATE_POOL:
      return {
        ...state,
        showCreatePool: !action.override ? !state.showWalletDialog : action.override === "open",
      };

    case LayoutActionTypes.HIDE_LIQUIDITY_EARN:
      return {
        ...state,
        liquidityEarnHidden: action.hide === undefined ? true : action.hide,
      };

    case LayoutActionTypes.ADD_BACKGROUND_LOADING:
      return {
        ...state,
        loadingTasks: {
          ...state.loadingTasks,
          [action.name]: {
            ...(state.loadingTasks[action.name] || {}),
            [action.uuid]: dayjs(),
          },
        },
        tasksRegistry: {
          ...state.tasksRegistry,
          [action.uuid]: action.name,
        },
      };
    case LayoutActionTypes.REMOVE_BACKGROUND_LOADING:
      taskName = state.tasksRegistry[action.uuid];
      if (!taskName)
        return state;
      loadingTask = state.loadingTasks[taskName];
      if (!loadingTask || !loadingTask[action.uuid])
        return state;

      delete loadingTask[action.uuid];
      if (!Object.keys(loadingTask).length)
        delete state.loadingTasks[taskName];
      delete state.tasksRegistry[action.uuid];
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
