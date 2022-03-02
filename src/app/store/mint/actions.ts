import { MintContract } from "./types";

export enum MintActionTypes {
  ADD_MINT_CONTRACT = "MINT_ADD_MINT_CONTRACT",
  DISMISS_MINT_CONTRACT = "MINT_DISMISS_MINT_CONTRACT",
  UPDATE_MINT_CONTRACT = "MINT_UPDATE_MINT_CONTRACT",
}

export function addMintContract(payload: MintContract) {
  return {
    type: MintActionTypes.ADD_MINT_CONTRACT,
    payload
  }
}

export function dismissMintContract(payload: MintContract) {
  return {
    type: MintActionTypes.DISMISS_MINT_CONTRACT,
    payload
  }
}

export function updateMintContract(payload: MintContract) {
  return {
    type: MintActionTypes.UPDATE_MINT_CONTRACT,
    payload
  }
}
