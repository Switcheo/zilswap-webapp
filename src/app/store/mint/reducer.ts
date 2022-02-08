import { logger } from "core/utilities";
import { LocalStorageKeys } from "app/utils/constants";
import { MintActionTypes } from "./actions";
import { MintState, MintContract } from "./types";

const loadedMintContractsData = localStorage.getItem(LocalStorageKeys.MintContracts);
let loadedMintContracts: MintContract[] = [];
try {
  if (loadedMintContractsData) {
    loadedMintContracts = JSON.parse(loadedMintContractsData);
    logger("loadedMintContracts", loadedMintContracts);
  }
} catch (error) {
  console.error(error);
  loadedMintContracts= [];
}

const saveMintContracts = (mintContracts: MintContract[]) => {
  localStorage.setItem(LocalStorageKeys.MintContracts, JSON.stringify(mintContracts));
}

const initial_state: MintState = {
  mintContracts: loadedMintContracts,
}

const reducer = (state: MintState = initial_state, action: any) => {
  const { payload } = action;

  switch (action.type) {
    case MintActionTypes.ADD_MINT_CONTRACT: {
      const newMintContracts = [...state.mintContracts, payload];

      saveMintContracts(newMintContracts);

      return {
        ...state,
        mintContracts: newMintContracts,
        activeMintContract: payload,
      }
    }

    case MintActionTypes.DISMISS_MINT_CONTRACT: {
      return {
        ...state,
        activeMintContract: undefined,
      }
    }

    case MintActionTypes.UPDATE_MINT_CONTRACT: {
      return {
        ...state,
        activeMintContract: payload,
      }
    }

    default:
      return state;
  }
}

export default reducer;
