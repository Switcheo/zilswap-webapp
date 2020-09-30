import { PoolFormState, PoolSelectProps } from "./types";

export enum PoolActionTypes {
  CLEAR = "POOL_CLEAR",
  SELECT = "POOL_SELECT",
  UPDATE = "POOL_UPDATE",
}

export function clear() {
  return {
    type: PoolActionTypes.CLEAR,
  }
}

export function select(payload: PoolSelectProps) {
  return {
    type: PoolActionTypes.SELECT,
    payload
  }
}

export function update(payload: Partial<PoolFormState>) {
  return {
    type: PoolActionTypes.UPDATE,
    payload
  }
}
