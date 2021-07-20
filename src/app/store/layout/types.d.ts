import { Dayjs } from "dayjs";

export interface LoadingTask {
  [index: string]: Dayjs;
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
  showAdvancedSetting: boolean;
  showNetworkSwitchDialog: boolean;
  showTransactionDialog: boolean;
  showTransferConfirmation: boolean;
  showMnemonicDialog: boolean;
  liquidityEarnHidden: boolean;
  showPoolType: PoolType;
  notification?: FormNotification;
  loadingTasks: LoadingTasks;
  tasksRegistry: any,
};

export type PoolType = "add" | "manage" | "remove";
export type OpenCloseState = "open" | "close";
