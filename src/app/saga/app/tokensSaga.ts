
import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";
import { Task } from "redux-saga";
import { all, call, put, fork, select, race, delay, take, cancel } from "redux-saga/effects";

import { actions } from "app/store";
import { TokenInfo } from "app/store/types";
import { SimpleMap, strings } from "app/utils";
import { logger } from "core/utilities";
import { balanceBatchRequest, BatchRequestType, sendBatchRequest,
  tokenAllowancesBatchRequest, tokenBalanceBatchRequest, ZilswapConnector } from "core/zilswap";
import { getWallet, getTokens, getBlockchain } from "../selectors";
import { PollIntervals, ETH_ADDRESS } from "app/utils/constants";
import { Blockchain } from "tradehub-api-js";
import { ETHBalances } from "core/ethereum";

const fetchEthTokensState = async (network: Network, tokens: SimpleMap<TokenInfo>, address: string | null) => {
  const updates: SimpleMap<TokenInfo> = {};

  if (!address) {
    return updates
  }

  logger("tokens saga", "retrieving eth token balances/allowances");

  // get eth balance
  const balance = await ETHBalances.getETHBalance({ network, walletAddress: address })
  updates[ETH_ADDRESS] = {
    ...tokens[ETH_ADDRESS],
    initialized: true,
    name: "Ethereum",
    symbol: "ETH",
    balance,
  }

  // get rest
  const tokenAddresses = Object.values(tokens).filter(t => t.blockchain === Blockchain.Ethereum && t.address !== ETH_ADDRESS).map(t => t.address)
  const balances = await ETHBalances.getTokenBalances({ network, tokenAddresses, walletAddress: address })
  Object.entries(balances).forEach(([address, balance]) => {
    updates[address] = {
      ...tokens[address],
      initialized: true,
      balance,
    }
  })

  return updates
}

const fetchZilTokensState = async (network: Network, tokens: SimpleMap<TokenInfo>, address: string | null) => {
  const updates: SimpleMap<TokenInfo> = {};

  if (!address) {
    return updates
  }

  logger("tokens saga", "retrieving zil token balances/allowances");

  const batchRequests: any[] = [];
  for (const t in tokens) {
    const token = tokens[t];
    if (token.blockchain !== Blockchain.Zilliqa) {
      continue
    }

    if (token.isZil) {
      batchRequests.push(balanceBatchRequest(token, address.replace("0x", "")))
    } else {
      batchRequests.push(tokenBalanceBatchRequest(token, address))
      batchRequests.push(tokenAllowancesBatchRequest(token, address))
    }
  }

  const batchResults = await sendBatchRequest(network, batchRequests)

  batchResults.forEach(r => {
    const { request, result } = r;
    const { token } = request;

    if (!updates[token.address]) {
      updates[token.address] = { ...token }
    }

    switch(request.type) {
      case BatchRequestType.Balance: {
        let balance: BigNumber | undefined = strings.bnOrZero(result.balance);

        const tokenInfo: Partial<TokenInfo> = {
          ...updates[token.address],
          initialized: true,
          name: "Zilliqa",
          symbol: "ZIL",
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
          symbol: tokenDetails?.symbol ?? token.symbol,
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
  const { wallet, bridgeWallets } = getWallet(yield select());
  const { tokens } = getTokens(yield select());
  const { network } = getBlockchain(yield select());

  const zilAddress = wallet ? wallet.addressInfo.byte20.toLowerCase() : null;
  const ethAddress = bridgeWallets.eth;

  const [resultZil, resultEth]: [SimpleMap<TokenInfo>, SimpleMap<TokenInfo>] = yield all([
    call(fetchZilTokensState, network, tokens, zilAddress),
    call(fetchEthTokensState, network, tokens, ethAddress)
  ])

  yield put(actions.Token.updateAll({ ...resultZil, ...resultEth }));
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
