import { TYPES } from "./actions";
import { LayoutState } from "./types";
import moment from "moment";

const initial_state: LayoutState = {
  showWalletDialog: false,
  loadingTasks: {},
  tasksRegistry: {},
};

const reducer = (state: LayoutState = initial_state, actions: any) => {
  let loadingTask = null, taskName;
  switch (actions.type) {
    case TYPES.TOGGLE_SHOW_WALLET:
      return {
        ...state,
        showWalletDialog: !actions.override ? !state.showWalletDialog : actions.override === "open",
      };

    case TYPES.ADD_BACKGROUND_LOADING:
      loadingTask = state.loadingTasks[actions.name];
      if (!loadingTask)
        loadingTask = {};

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
    case TYPES.REMOVE_BACKGROUND_LOADING:
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
