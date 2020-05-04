import { SwapFormState, UpdateExtendedPayload } from "./types";

export enum SwapActionTypes {
  UPDATE,
  UPDATE_EXTENDED,
  REVERSE
}

export function update(payload: SwapFormState) {
  return {
    type: SwapActionTypes.UPDATE,
    payload
  }
}

export function update_extended(payload: UpdateExtendedPayload) {
  return {
    type: SwapActionTypes.UPDATE_EXTENDED,
    payload
  }
}

export function reverse() {
  return {
    type: SwapActionTypes.REVERSE
  }
}