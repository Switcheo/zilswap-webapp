import BigNumber from "bignumber.js";
import { Blockchain } from "tradehub-api-js";
import { TokenActionTypes } from "../token/actions";
import { TokenUpdateProps } from "../token/types";
import { BridgeActionTypes } from "./actions";
import { BridgeFormState } from "./types";

const initial_state: BridgeFormState = {
  tokens: {
    [Blockchain.Zilliqa]: [
      {
        blockchain: Blockchain.Zilliqa,
        tokenAddress: '5d3ecead6149b264db1ffbc45625e0131ac06d3c',
        denom: 'usdt.z',
        toBlockchain: Blockchain.Ethereum,
        toTokenAddress: '1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        toDenom: 'usdt.e',
      }
    ],
    [Blockchain.Ethereum]: [
      {
        blockchain: Blockchain.Ethereum,
        tokenAddress: '1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        denom: 'usdt.e',
        toBlockchain: Blockchain.Zilliqa,
        toTokenAddress: '5d3ecead6149b264db1ffbc45625e0131ac06d3c',
        toDenom: 'usdt.z',
      }
    ],
  },

  transferAmount: new BigNumber(0),

  isInsufficientReserves: false,
  forNetwork: null,
}

const reducer = (state: BridgeFormState = initial_state, action: any) => {
  const { payload } = action;

  switch (action.type) {

    case BridgeActionTypes.CLEAR_FORM:
      return {
        sourceAddress: '',
        transferAmount: new BigNumber(0),

        isInsufficientReserves: false,
        forNetwork: null,
      };

    case BridgeActionTypes.UPDATE:
      return { ...state, ...payload };

    case TokenActionTypes.TOKEN_UPDATE:
      const updateProps: TokenUpdateProps = payload;
      if (updateProps.address !== state.token?.address)
        return state;

      return {
        ...state,
        ...updateProps.address === state.token?.address && {
          token: {
            ...state.token,
            ...updateProps,
          }
        }
      };

    default:
      return state;
  }
}

export default reducer;
