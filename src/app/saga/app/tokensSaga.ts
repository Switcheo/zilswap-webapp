
import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";
import { Task } from "redux-saga";
import { call, put, fork, select, race, delay, take, cancel } from "redux-saga/effects";

import { actions } from "app/store";
import { TokenInfo } from "app/store/types";
import { SimpleMap, strings } from "app/utils";
import { logger } from "core/utilities";
import { balanceBatchRequest, BatchRequestType, sendBatchRequest,
  tokenAllowancesBatchRequest, tokenBalanceBatchRequest, ZilswapConnector } from "core/zilswap";
import { getWallet, getTokens, getBlockchain } from "../selectors";
import { PollIntervals } from "app/utils/constants";

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
        };

        updates[token.address] = { ...updates[token.address], ...tokenInfo };
        break;
      }

      case BatchRequestType.TokenBalance: {
        const tokenDetails = ZilswapConnector.getToken(token.address);
        const tokenPool = ZilswapConnector.getPool(token.address);

        const tokenInfo: Partial<TokenInfo> = {
          initialized: true,
          symbol: tokenDetails?.symbol ?? "",
          pool: tokenPool ?? undefined,
          balance: result ? strings.bnOrZero(result.balances[address]) : token.balance,
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

  yield put(actions.Token.updateAll(result));
}

function* watchRefetchTokensState() {
  let lastTask: Task | null = null
  while (true) {
    yield race({
      poll: delay(PollIntervals.TokenState), // refetch at least once every N seconds
      refetch: take(actions.Token.TokenActionTypes.TOKEN_REFETCH_STATE),
    });
    if (lastTask) {
      yield cancel(lastTask)
    }
    lastTask = yield fork(updateTokensState)
  }
}

export default function* tokensSaga() {
  logger("init tokens saga");
  yield fork(watchRefetchTokensState);
}
