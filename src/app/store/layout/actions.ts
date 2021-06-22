import { OpenCloseState, PoolType, FormNotification } from "./types";

export const LayoutActionTypes = {
  TOGGLE_SHOW_WALLET: "TOGGLE_SHOW_WALLET",
  SHOW_POOL_TYPE: "SHOW_POOL_TYPE",
  SHOW_ADVANCED_SETTING: "SHOW_ADVANCED_SETTING",
  TOGGLE_SHOW_CREATE_POOL: "TOGGLE_SHOW_CREATE_POOL",
  HIDE_LIQUIDITY_EARN: "HIDE_LIQUIDITY_EARN",
  UPDATE_NOTIFICATION: "UPDATE_NOTIFICATION",
  TOGGLE_SHOW_TRANSACTIONS: "TOGGLE_SHOW_TRANSACTIONS",
  SHOW_TRANSFER_CONFIRMATION: "SHOW_TRANSFER_CONFIRMATION",

  ADD_BACKGROUND_LOADING: "ADD_BACKGROUND_LOADING",
  REMOVE_BACKGROUND_LOADING: "REMOVE_BACKGROUND_LOADING",
};

export function toggleShowWallet(override?: OpenCloseState) {
  return {
    type: LayoutActionTypes.TOGGLE_SHOW_WALLET,
    override,
  }
};
export function toggleShowCreatePool(override?: OpenCloseState) {
  return {
    type: LayoutActionTypes.TOGGLE_SHOW_CREATE_POOL,
    override,
  }
};
export function toggleShowTransactions(override?: OpenCloseState) {
  return {
    type: LayoutActionTypes.TOGGLE_SHOW_TRANSACTIONS,
    override,
  }
};
export function showPoolType(poolType?: PoolType) {
  return {
    type: LayoutActionTypes.SHOW_POOL_TYPE,
    poolType,
  }
};
export function showAdvancedSetting(show: boolean = true) {
  return {
    type: LayoutActionTypes.SHOW_ADVANCED_SETTING,
    show,
  }
};
export function showTransferConfirmation(show: boolean = true) {
  return {
    type: LayoutActionTypes.SHOW_TRANSFER_CONFIRMATION,
    show,
  }
};
export function hideLiquidityEarn(hide: boolean = true) {
  return {
    type: LayoutActionTypes.HIDE_LIQUIDITY_EARN,
    hide,
  }
};

export function updateNotification(notification?: FormNotification) {
  return {
    type: LayoutActionTypes.UPDATE_NOTIFICATION,
    notification,
  }
};

export function addBackgroundLoading(name: string, uuid: string) {
  return {
    type: LayoutActionTypes.ADD_BACKGROUND_LOADING,
    name, uuid,
  };
};
export function removeBackgroundLoading(uuid: string) {
  return {
    type: LayoutActionTypes.REMOVE_BACKGROUND_LOADING,
    uuid,
  };
};
