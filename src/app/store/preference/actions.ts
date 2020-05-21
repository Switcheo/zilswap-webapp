import { PreferenceStateInitProps, PreferenceStateUpdateProps } from "./types";

export enum PreferenceActionTypes {
  INIT = "PREFERENCE_INIT", UPDATE = "PREFERENCE_UPDATE"
};

export function init(payload: PreferenceStateInitProps) {
  return {
    type: PreferenceActionTypes.INIT,
    payload
  }
};

export function update(payload: PreferenceStateUpdateProps) {
  return {
    type: PreferenceActionTypes.UPDATE,
    payload
  }
};