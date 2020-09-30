import { SwapFormState, UpdateExtendedPayload } from "./types";

export enum SwapActionTypes {
  CLEAR_FORM = "SWAP_CLEAR_FORM",
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

export function clearForm() {
  return {
    type: SwapActionTypes.CLEAR_FORM,
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
