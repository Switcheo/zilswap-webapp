import { OpenCloseState, PoolType, FormNotification } from "./types";

export const ActionTypes = {
  TOGGLE_SHOW_WALLET: "TOGGLE_SHOW_WALLET",
  SHOW_POOL_TYPE: "SHOW_POOL_TYPE",
  TOGGLE_SHOW_CREATE_POOL: "TOGGLE_SHOW_CREATE_POOL",
  UPDATE_NOTIFICATION: "UPDATE_NOTIFICATION",

  ADD_BACKGROUND_LOADING: "ADD_BACKGROUND_LOADING",
  REMOVE_BACKGROUND_LOADING: "REMOVE_BACKGROUND_LOADING",
};

export function toggleShowWallet(override?: OpenCloseState) {
  return {
    type: ActionTypes.TOGGLE_SHOW_WALLET,
    override,
  }
};
export function toggleShowCreatePool(override?: OpenCloseState) {
  return {
    type: ActionTypes.TOGGLE_SHOW_CREATE_POOL,
    override,
  }
};
export function showPoolType(poolType?: PoolType) {
  return {
    type: ActionTypes.SHOW_POOL_TYPE,
    poolType,
  }
};

export function updateNotification(notification?: FormNotification) {
  return {
    type: ActionTypes.UPDATE_NOTIFICATION,
    notification,
  }
};

export function addBackgroundLoading(name: string, uuid: string) {
  return {
    type: ActionTypes.ADD_BACKGROUND_LOADING,
    name, uuid,
  };
};
export function removeBackgroundLoading(uuid: string) {
  return {
    type: ActionTypes.REMOVE_BACKGROUND_LOADING,
    uuid,
  };
};