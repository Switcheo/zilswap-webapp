import moment from "moment";

export interface LoadingTask {
  [index: string]: moment.Moment;
};
export interface LoadingTasks {
  [index: string]: LoadingTask;
};

export interface LayoutState {
  showWalletDialog: boolean;
  loadingTasks: LoadingTasks;
  tasksRegistry: any,
};

export type OpenCloseState = "open" | "close";