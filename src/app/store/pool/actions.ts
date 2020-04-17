import { PoolFormState, PoolUpdateExtendedPayload } from "./types";

export const TYPES = {
  UPDATE: "UPDATE",
  UPDATE_EXTENDED: "UPDATE_EXTENDED",
}

export function update(payload: PoolFormState) {
  return {
    type: TYPES.UPDATE,
    payload
  }
}

export function update_extended(payload: PoolUpdateExtendedPayload) {
  return {
    type: TYPES.UPDATE_EXTENDED,
    payload
  }
}