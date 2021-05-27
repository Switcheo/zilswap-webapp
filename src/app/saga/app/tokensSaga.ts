
import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";
import { call, put, fork, select, takeLatest } from "redux-saga/effects";

import { actions } from "app/store";
import { TokenInfo, TokenBalanceMap } from "app/store/types";
import { SimpleMap, strings } from "app/utils";
import { logger } from "core/utilities";
import { balanceBatchRequest, BatchRequestType, sendBatchRequest,
  tokenAllowancesBatchRequest, tokenBalanceBatchRequest, ZilswapConnector } from "core/zilswap";
import { getWallet, getTokens, getBlockchain } from "../selectors";

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

  batchResults.forEach(r => {
    const { request, result } = r;
    const { token } = request;

    if (!updates[token.address]) {
      updates[token.address] = {
        initialized: token.initialized,
        isZil: token.isZil,
        isZwap: token.isZwap,
        name: token.name,
        symbol: token.symbol,
        registered: token.registered,
        whitelisted: token.whitelisted,
        address: token.address,
        decimals: token.decimals
      }
    }

    switch(request.type) {
      case BatchRequestType.Balance: {
        let balance: BigNumber | undefined = strings.bnOrZero(result.balance);

        const tokenInfo: Partial<TokenInfo> = {
          ...updates[token.address],
          initialized: true,
          name: "Zilliqa",
          balance,
          balances: {
            ...(balance && {
              // fake the zrc-2 balances map by initializing with own zil balance
              [address]: balance!,
            }),
          },
        };

        updates[token.address] = { ...updates[token.address], ...tokenInfo };
        break;
      }

      case BatchRequestType.TokenBalance: {
        const tokenDetails = ZilswapConnector.getToken(token.address);
        const tokenPool = ZilswapConnector.getPool(token.address);

        let { balance } = token
        let balances: TokenBalanceMap =  {};

        if(result) {
          for (const address in result.balances)
            balances[address] = strings.bnOrZero(
              result.balances[address]
            );
          balance = strings.bnOrZero(balances[address]);
        }

        const tokenInfo: Partial<TokenInfo> = {
          initialized: true,
          symbol: tokenDetails?.symbol ?? "",
          pool: tokenPool ?? undefined,
          balance,
          balances,
        };

        updates[token.address] = { ...updates[token.address], ...tokenInfo };
        break;
      }

      case BatchRequestType.TokenAllowance: {
        const allowances = result?.allowances[address]
        if (allowances) {
          updates[token.address] = { ...updates[token.address], allowances };
        }
        break;
      }
    }
  })

  return updates;
}

function* updateTokensState() {
  logger("tokens saga", "called updateTokensState")
  const { wallet } = getWallet(yield select());

  if (!wallet) return;

  const { tokens } = getTokens(yield select());
  const { network } = getBlockchain(yield select());

  const address = wallet!.addressInfo.byte20.toLowerCase();

  const result: SimpleMap<TokenInfo> = yield call(fetchTokensState, network, tokens, address);

  logger("tokens saga", {result});
  for (const [key, value] of Object.entries(result)) {
    logger(`updating ${value.symbol}: ${key}`);
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
