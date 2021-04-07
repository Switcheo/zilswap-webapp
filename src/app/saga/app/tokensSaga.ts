
import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";
import { call, put, fork, select, takeLatest } from "redux-saga/effects";

import { actions } from "app/store";
import { RootState, TokenInfo } from "app/store/types";
import { SimpleMap, strings } from "app/utils";
import { ConnectedWallet } from "core/wallet";
import { logger } from "core/utilities";
import { balanceBatchRequest, BatchRequestType, sendBatchRequest,
  tokenAllowancesBatchRequest, tokenBalanceBatchRequest, ZilswapConnector } from "core/zilswap";

const fetchTokensState = async (network: Network, tokens: SimpleMap<TokenInfo>, address: string) => {
  logger("tokens saga", "retrieving token balances/allowances");

  const batchRequests: any[] = [];
  for (const t in tokens) {
    const token = tokens[t];

    if (token.isZil) {
      batchRequests.push(balanceBatchRequest(token, address.replace("0x", "")))
    } else {
      batchRequests.push(tokenBalanceBatchRequest(token, address))
      batchRequests.push(tokenAllowancesBatchRequest(token, address))
    }
  }

  const batchResults = await sendBatchRequest(network, batchRequests)
  const updates: SimpleMap<TokenInfo> = {};

  batchResults.forEach(result => {
    let token = result.request.token;

    switch(result.request.type) {
      case BatchRequestType.Balance: {
        let balance: BigNumber | undefined;
        balance = strings.bnOrZero(result.result.balance);
        updates[token.address] = {
          ...updates[token.address],
          name: "Zilliqa",
          address: token.address,
          balance: balance,
          balances: {
            ...(balance && {
              // initialize with own wallet balance
              [address]: balance!,
            }),
          },
          initialized: true,
        }
        break;
      }

      case BatchRequestType.TokenBalance: {
        const tokenDetails = ZilswapConnector.getToken(token.address);

        let { balance, balances } = token

        balances = {};

        if(result.result) {
          for (const address in result.result.balances)
            balances[address] = strings.bnOrZero(
              result.result.balances[address]
            );

          balance = strings.bnOrZero(balances[address]);
        }

        const tokenInfo: TokenInfo = {
          initialized: true,
          isZil: false,
          isZwap: token.isZwap,
          name: token.name,

          registered: token.registered,
          whitelisted: token.whitelisted,
          address: token.address,
          decimals: token.decimals,

          symbol: tokenDetails?.symbol ?? "",

          balance: balance,
          balances: balances,
        };
        updates[token.address] = { ...updates[token.address], ...tokenInfo };
        break;
      }

      case BatchRequestType.TokenAllowance: {
        let { allowances } = token;
        if(result.result) {
          allowances = result.result.allowances[address] || {};
        }
        updates[token.address] = {
          ...updates[token.address],
          address: token.address,
          allowances: allowances,
        };
        break;
      }
    }
  })

  return updates;
}

function* updateTokensState() {
  logger("tokens saga", "called updateTokensState")
  const wallet: ConnectedWallet = yield select((state: RootState) => state.wallet.wallet);

  if (!wallet) { return }

  const tokens: SimpleMap<TokenInfo> = yield select((state: RootState) => state.token.tokens);
  const network: Network = yield select((state: RootState) => state.layout.network);

  const address = wallet!.addressInfo.byte20.toLowerCase();

  const result: SimpleMap<TokenInfo> = yield call(fetchTokensState, network, tokens, address);

  logger("tokens saga", {result});
  for (const [key, value] of Object.entries(result)) {
    console.log(`updating ${value.symbol}: ${key}`);
    yield put(actions.Token.update(value));
  }
}

function* watchUpdateTokensState() {
  yield takeLatest(actions.Token.TokenActionTypes.TOKEN_UPDATE_STATE, updateTokensState)

}

export default function* tokensSaga() {
  logger("init tokens saga");
  yield fork(watchUpdateTokensState);
}
