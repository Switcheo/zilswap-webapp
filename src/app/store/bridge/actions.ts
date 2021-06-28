import { BridgeableTokenMapping, BridgeFormState } from "./types";

export enum BridgeActionTypes {
  CLEAR_FORM = "BRIDGE_CLEAR_FORM",
  UPDATE = "BRIDGE_UPDATE",
  SET_TOKENS = "BRIDGE_SET_TOKENS",
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

export function setTokens(payload: BridgeableTokenMapping) {
  return {
    type: BridgeActionTypes.SET_TOKENS,
    payload
  }
}
