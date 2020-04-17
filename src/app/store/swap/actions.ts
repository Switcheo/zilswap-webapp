import { SwapFormState, UpdateExtendedPayload } from "./types";

export const TYPES = {
  UPDATE: "UPDATE",
  UPDATE_EXTENDED: "UPDATE_EXTENDED",
  REVERSE: "REVERSE"
}

export function update(payload: SwapFormState) {
  return {
    type: TYPES.UPDATE,
    payload
  }
}

export function update_extended(payload: UpdateExtendedPayload) {
  return {
    type: TYPES.UPDATE_EXTENDED,
    payload
  }
}

export function reverse() {
  return {
    type: TYPES.REVERSE
  }
}