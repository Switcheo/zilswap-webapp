import { BridgeableTokenMapping, BridgeFormState, BridgeTx } from "./types";
import { WithdrawFee } from "./types";

export enum BridgeActionTypes {
  CLEAR_FORM = "BRIDGE_CLEAR_FORM",
  UPDATE_FORM = "BRIDGE_UPDATE_FORM",
  SET_TOKENS = "BRIDGE_SET_TOKENS",
  ADD_BRIDGE_TXS = "BRIDGE_ADD_BRIDGE_TXS",
  UPDATE_FEE = "BRIDGE_UPDATE_FEE",
}

export function updateForm(payload: Partial<BridgeFormState>) {
  return {
    type: BridgeActionTypes.UPDATE_FORM,
    payload
  }
}

export function addBridgeTx(payload: BridgeTx[]) {
  return {
    type: BridgeActionTypes.ADD_BRIDGE_TXS,
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

export function updateFee(payload: WithdrawFee) {
  return {
    type: BridgeActionTypes.UPDATE_FEE,
    payload
  }
}