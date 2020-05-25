import { SwapFormState, UpdateExtendedPayload } from "./types";

export enum SwapActionTypes {
  UPDATE = "SWAP_UPDATE",
  UPDATE_EXTENDED = "SWAP_UPDATE_EXTENDED",
  REVERSE = "SWAP_REVERSE"
}

export function update(payload: Partial<SwapFormState>) {
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