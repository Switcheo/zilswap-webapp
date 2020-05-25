import { PoolFormState, PoolSelectProps } from "./types";

export enum PoolActionTypes {
  POOL_SELECT = "POOL_SELECT",
  UPDATE = "POOL_UPDATE",
}


export function selectPool(payload: PoolSelectProps) {
  return {
    type: PoolActionTypes.POOL_SELECT,
    payload
  }
}

export function update(payload: Partial<PoolFormState>) {
  return {
    type: PoolActionTypes.UPDATE,
    payload
  }
}