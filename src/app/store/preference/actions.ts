import { PreferenceStateInitProps, PreferenceStateUpdateProps } from "./types";

export const TYPES = {
  INIT: "INIT",
  UPDATE: "UPDATE",
};

export function init(payload: PreferenceStateInitProps) {
  return {
    type: TYPES.INIT,
    payload
  }
};

export function update(payload: PreferenceStateUpdateProps) {
  return {
    type: TYPES.UPDATE,
    payload
  }
};