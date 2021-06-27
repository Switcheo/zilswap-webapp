import { BridgeFormState } from "./types";

export enum BridgeActionTypes {
  CLEAR_FORM = "BRIDGE_CLEAR_FORM",
  UPDATE = "BRIDGE_UPDATE",
}

export function update(payload: Partial<BridgeFormState>) {
  return {
    type: BridgeActionTypes.UPDATE,
    payload
  }
}

export function clearForm() {
  return {
    type: BridgeActionTypes.CLEAR_FORM,
  }
}
