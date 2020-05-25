import moment from "moment";

export interface LoadingTask {
  [index: string]: moment.Moment;
};
export interface LoadingTasks {
  [index: string]: LoadingTask;
};

export interface FormNotification {
  type: string;
  message: string;
};

export interface LayoutState {
  showWalletDialog: boolean;
  showCreatePool: boolean;
  showPoolType: PoolType;
  notification?: FormNotification;
  loadingTasks: LoadingTasks;
  tasksRegistry: any,
};

export type PoolType = "add" | "remove";
export type OpenCloseState = "open" | "close";