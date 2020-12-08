import moment from "moment";
import { Network } from "zilswap-sdk/lib/constants";

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
  liquidityEarnHidden: boolean;
  showPoolType: PoolType;
  notification?: FormNotification;
  network: Network;
  loadingTasks: LoadingTasks;
  tasksRegistry: any,
};

export type PoolType = "add" | "manage" | "remove";
export type OpenCloseState = "open" | "close";
