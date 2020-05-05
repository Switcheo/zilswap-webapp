import { PoolFormState, PoolUpdateExtendedPayload } from "./types";

export enum PoolActionTypes {
  UPDATE, UPDATE_EXTENDED
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