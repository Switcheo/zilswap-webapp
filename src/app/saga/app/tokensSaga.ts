
import BigNumber from "bignumber.js";
import { Network } from "zilswap-sdk/lib/constants";
import { Task } from "redux-saga";
import { all, call, cancel, delay, fork, put, race, select, take } from "redux-saga/effects";
import { ethers } from "ethers";
import { Blockchain } from 'carbon-js-sdk/lib'
import { logger } from "core/utilities";
import {
  BatchRequestType, ZilswapConnector, balanceBatchRequest,
  sendBatchRequest, tokenAllowancesBatchRequest, tokenBalanceBatchRequest
} from "core/zilswap";
import { ETHBalances } from "core/ethereum";
import { actions } from "app/store";
import { TokenInfo } from "app/store/types";
import { SimpleMap, bnOrZero } from "app/utils";
import { BRIDGEABLE_EVM_CHAINS, EthContractABIs, EthRpcUrl, ETH_ADDRESS, PollIntervals } from "app/utils/constants";
import { getBlockchain, getTokens, getWallet } from "../selectors";

/**
 * This function returns a Promise to return the balance of the specified evm token
 * @param {ethers.Contract} contract the token contract
 * @param {string} address the evm wallet address
 * @param {string} tokenAddress the address of the token
 * @returns {Promise<[string, BigNumber]>}
 */
const fetchEthTokenBalance = async(contract: ethers.Contract, address: string, tokenAddress: string): Promise<[string, BigNumber]> => {
  return [tokenAddress, new BigNumber((await contract.balanceOf(address)).toString())]
}

const fetchEthTokensState = async (network: Network, tokens: SimpleMap<TokenInfo>, address: string | null) => {
  const updates: SimpleMap<TokenInfo> = {};

  try {
    if (!address || Object.values(tokens).length < 1) {
      return updates
    }

    logger("tokens saga", "retrieving evm token balances/allowances");

    // get mainnet eth balance
    const balance = await ETHBalances.getETHBalance({ network, walletAddress: address })
    updates[ETH_ADDRESS] = {
      ...tokens[ETH_ADDRESS],
      address: ETH_ADDRESS,
      initialized: true,
    name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      blockchain: Blockchain.Ethereum,
      balance,
    }

    const fetchBalancePromises: Promise<[string, BigNumber]>[] = [] //iterable of token balance Promises to be resolved in parallel later
    for (const evmChain of BRIDGEABLE_EVM_CHAINS) {
      const tokenAddresses = Object.values(tokens).filter(t => t.blockchain === evmChain && t.address !== ETH_ADDRESS).map(t => t.address)
      if (!tokenAddresses.length) return;

      const provider = new ethers.providers.JsonRpcProvider(EthRpcUrl[network][evmChain]) as ethers.providers.JsonRpcProvider

      for (const tokenAddress of tokenAddresses) {
        const assetContract: ethers.Contract = new ethers.Contract(tokenAddress, EthContractABIs[network] ?? [], provider)
        fetchBalancePromises.push(fetchEthTokenBalance(assetContract, address, tokenAddress))
      }
    }

    /**
     * resolve Promises in parallel instead of sequential looping and continues 
     * fetching balance even if one of the Promise fails/rejects
     */
    const balances = await Promise.allSettled(fetchBalancePromises)

    
    balances.filter(result => 'value' in result) as PromiseFulfilledResult<[string, BigNumber]>[] //filter for resolved Promises
    balances.forEach(result => {
      if (result.status === "rejected") return
      const [address, balance] = result.value
      updates[address] = {
        ...tokens[address],
        initialized: true,
        balance,
      }
    })
  } catch (error) {
    console.error("failed to read evm balances")
    return updates;
  }

  return updates
}

const fetchZilTokensState = async (network: Network, tokens: SimpleMap<TokenInfo>, address: string | null) => {
  const updates: SimpleMap<TokenInfo> = {};

  try {

    if (!address || Object.values(tokens).length < 1) {
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

      switch (request.type) {
        case BatchRequestType.Balance: {
          let balance: BigNumber | undefined = bnOrZero(result.balance);

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
            balance: result ? bnOrZero(result.balances[address]) : token.balance,
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
  } catch (error) {
    console.error("failed to read zil balances")
    console.error(error);
    return updates;
  }
}

function* updateTokensState() {
  logger("tokens saga", "called updateTokensState")
  const { wallet, bridgeWallets } = getWallet(yield select());
  const { tokens } = getTokens(yield select());
  const { network } = getBlockchain(yield select());

  const zilAddress = wallet ? wallet.addressInfo.byte20.toLowerCase() : null;
  const ethAddress = bridgeWallets.eth ? bridgeWallets.eth.address : null;

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
