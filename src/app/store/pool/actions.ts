import { PoolFormState, PoolUpdateExtendedPayload } from "./types";

export enum PoolActionTypes {
  UPDATE, UPDATE_EXTENDED, UPDATE_POOL
}

export function update(payload: PoolFormState) {
  return {
    type: PoolActionTypes.UPDATE,
    payload
  }
}

export function update_extended(payload: PoolUpdateExtendedPayload) {
  return {
    type: PoolActionTypes.UPDATE_EXTENDED,
    payload
  }
}

export function update_pool(payload: any) {
  return {
    type: PoolActionTypes.UPDATE_POOL,
    payload
  }
}