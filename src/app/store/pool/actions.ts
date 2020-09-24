import { PoolFormState, PoolSelectProps } from "./types";

export enum PoolActionTypes {
  SELECT = "POOL_SELECT",
  UPDATE = "POOL_UPDATE",
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
