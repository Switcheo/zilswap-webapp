import { BridgeFormState, BridgeTx, BridgeableToken } from "./types";
import { WithdrawFee } from "./types";

export enum BridgeActionTypes {
  DISMISS_TX = "BRIDGE_DISMISS_TX",
  UPDATE_FORM = "BRIDGE_UPDATE_FORM",
  SET_TOKENS = "BRIDGE_SET_TOKENS",
  ADD_BRIDGE_TXS = "BRIDGE_ADD_BRIDGE_TXS",
  SET_PREVIEW_BRIDGE_TX = "BRIDGE_SET_PREVIEW_BRIDGE_TX",
  UPDATE_FEE = "BRIDGE_UPDATE_FEE",
}

export function updateForm(payload: Partial<BridgeFormState>) {
  return {
    type: BridgeActionTypes.UPDATE_FORM,
    payload
  }
}

export function addBridgeTx(payload: Partial<BridgeTx>[]) {
  return {
    type: BridgeActionTypes.ADD_BRIDGE_TXS,
    payload
  }
}

export function setPreviewBridgeTx(payload: BridgeTx | undefined) {
  return {
    type: BridgeActionTypes.SET_PREVIEW_BRIDGE_TX,
    payload
  }
}

export function dismissBridgeTx(payload: BridgeTx) {
  return {
    type: BridgeActionTypes.DISMISS_TX,
    payload
  }
}

export function setTokens(payload: BridgeableToken[]) {
  return {
    type: BridgeActionTypes.SET_TOKENS,
    payload
  }
}

export function updateFee(payload?: WithdrawFee) {
  return {
    type: BridgeActionTypes.UPDATE_FEE,
    payload
  }
}
