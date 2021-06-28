
import { channel, Channel, eventChannel, EventChannel } from "redux-saga";
import { fork, call, put, select, take, takeEvery, cancelled } from "redux-saga/effects";
import { AppState, ObservedTx, TxReceipt, TxStatus, Zilswap } from "zilswap-sdk";
import { ZiloAppState } from "zilswap-sdk/lib/zilo"

import { actions } from "app/store";
import { ChainInitAction } from "app/store/blockchain/actions";
import { WalletAction, WalletActionTypes } from "app/store/wallet/actions";
import { Transaction, TokenInfo } from "app/store/types";
import { RPCEndpoints, ZIL_ADDRESS } from "app/utils/constants";
import { connectWalletZilPay, ConnectedWallet, WalletConnectType } from "core/wallet";
import { ZILO_DATA } from "core/zilo/constants";
import { ZWAPRewards } from "core/zwap";
import { toBech32Address, ZilswapConnector } from "core/zilswap";
import { logger } from "core/utilities";
import { getConnectedZilPay } from "core/utilities/zilpay";
import { PoolTransaction, PoolTransactionResult, ZAPStats } from "core/utilities/zap-stats";
import { getBlockchain, getWallet, getTransactions } from '../selectors'
import { detachedToast } from "app/utils/useToaster";
import { BridgeableToken } from "app/store/bridge/types";
import { Network } from "zilswap-sdk/lib/constants";
import { Blockchain } from "tradehub-api-js";
import { SimpleMap } from "app/utils";

const getProviderOrKeyFromWallet = (wallet: ConnectedWallet | null) => {
  if (!wallet) return null;

  switch (wallet.type) {
    case WalletConnectType.PrivateKey:
      return wallet.addressInfo.privateKey
    case WalletConnectType.Zeeves:
    case WalletConnectType.ZilPay:
      return wallet.provider;
    case WalletConnectType.Moonlet:
      throw new Error("moonlet support under development");
    default:
      throw new Error("unknown wallet connector");
  }
}

const zilPayObserver = (zilPay: any) => {
  return eventChannel<ConnectedWallet>(emitter => {
    const accountObserver = zilPay.wallet.observableAccount();
    const networkObserver = zilPay.wallet.observableNetwork();

    accountObserver.subscribe(async (account: any) => {
      logger(`Zilpay account changed to: ${account.bech32}`)
      const walletResult = await connectWalletZilPay(zilPay);
      if (walletResult?.wallet) {
        emitter(walletResult.wallet)
      }
    });

    networkObserver.subscribe(async (net: string) => {
      logger(`Zilpay network changed to: ${net}`)
      const walletResult = await connectWalletZilPay(zilPay);
      if (walletResult?.wallet) {
        emitter(walletResult.wallet)
      }
    });

    logger('registered zilpay observer')

    return () => {
      logger('deregistered zilpay observer')
      accountObserver.unsubscribe()
      networkObserver.unsubscribe()
    }
  })
}

type TxObservedPayload = { tx: ObservedTx, status: TxStatus, receipt?: TxReceipt }
const txObserver = (channel: Channel<TxObservedPayload>) => {
  return (tx: ObservedTx, status: TxStatus, receipt?: TxReceipt) => {
    logger('tx observed', tx)
    channel.put({ tx, status, receipt })
  }
}

function* txObserved(payload: TxObservedPayload) {
  logger('tx observed action', payload)
  const { tx, status, receipt } = payload

  yield put(actions.Rewards.removePendingClaimTx(tx.hash));
  yield put(actions.Transaction.update({ hash: tx.hash, status: status, txReceipt: receipt }));

  detachedToast(`transaction confirmed`, { hash: tx.hash });

  // refetch all token states if updated TX is currently recorded within state
  const { transactions } = getTransactions(yield select());
  if (transactions.find((transaction: Transaction) => transaction.hash === tx.hash)) {
    yield put(actions.Token.refetchState());
  }
}

type StateChangeObservedPayload = { state: ZiloAppState }
const ziloStateObserver = (channel: Channel<StateChangeObservedPayload>) => {
  return (state: ZiloAppState) => {
    logger('zilo state changed observed', state)
    channel.put({ state })
  }
}

function* stateChangeObserved(payload: StateChangeObservedPayload) {
  logger('zilo state change action')
  yield put(actions.Blockchain.setZiloState(payload.state.contractInit!._this_address, payload.state))
}

type WrapperMappingsResult = { height: string, result: { [key: string]: string }}
type TradeHubToken = {denom: string, decimals: string, blockchain: Blockchain.Zilliqa | Blockchain.Ethereum, asset_id: string, symbol: string, name: string, lockproxy_hash: string}
type TradeHubTokensResult = { height: string, result: ReadonlyArray<TradeHubToken> }
type BridgeMappingResult =  { [Blockchain.Zilliqa]: BridgeableToken[] , [Blockchain.Ethereum]: BridgeableToken[] }

const fetchJSON = async (url: string) => {
  const res = await fetch(url)
  return res.json()
}

const addMapping = (r: BridgeMappingResult, a: TradeHubToken, b: TradeHubToken) => {
  r[a.blockchain].push({
    blockchain: a.blockchain,
    tokenAddress: a.asset_id.toLowerCase(),
    lockproxyAddress: a.lockproxy_hash,
    denom: a.denom,
    toBlockchain: b.blockchain,
    toTokenAddress: b.asset_id.toLowerCase(),
    toDenom: b.denom,
  })
}

const addToken = (r: SimpleMap<TokenInfo>, t: TradeHubToken) => {
  const address = t.blockchain === Blockchain.Zilliqa ? toBech32Address(t.asset_id) : `0x${t.asset_id.toLowerCase()}`
  if (r[address]) return
  r[address] = {
    initialized: false,
    registered: true,
    whitelisted: true,
    isZil: false, // TODO: maybe true?
    isZwap: false, // TODO: maybe true?
    address,
    decimals: parseInt(t.decimals, 10),
    symbol: t.symbol,
    name: `${t.name} (${t.denom})`,
    balance: undefined,
    allowances: {},
    pool: undefined,
    blockchain: t.blockchain,
  }
}

function* initialize(action: ChainInitAction, txChannel: Channel<TxObservedPayload>, stateChannel: Channel<StateChangeObservedPayload>) {
  let sdk: Zilswap | null = null;
  try {
    yield put(actions.Layout.addBackgroundLoading('initChain', 'INIT_CHAIN'))
    yield put(actions.Wallet.update({ wallet: null }))

    const { network, wallet } = action.payload
    const providerOrKey = getProviderOrKeyFromWallet(wallet)
    const { observingTxs } = getTransactions(yield select());
    const { network: prevNetwork } = getBlockchain(yield select());

    sdk = new Zilswap(network, providerOrKey ?? undefined, { rpcEndpoint: RPCEndpoints[network] });
    logger('zilswap sdk initialized')

    yield call([sdk, sdk.initialize], txObserver(txChannel), observingTxs)
    for (let i = 0; i < ZILO_DATA[network].length; ++i) {
      const data = ZILO_DATA[network][i]
      if (data.comingSoon) continue

      yield call([sdk, sdk.registerZilo], data.contractAddress, ziloStateObserver(stateChannel))
      logger('zilo sdk initialized')
    }
    ZilswapConnector.setSDK(sdk)

    // load tokens
    const appState: AppState = yield call([sdk, sdk.getAppState]);
    const zilswapTokens = appState.tokens
    const tokens: SimpleMap<TokenInfo> = Object.keys(zilswapTokens).reduce((acc, addr) => {
      const tkn = zilswapTokens[addr]
      acc[tkn.address] = {
        initialized: false,
        registered: tkn.registered,
        whitelisted: tkn.whitelisted,
        isZil: tkn.address === ZIL_ADDRESS,
        isZwap: tkn.address === ZWAPRewards.TOKEN_CONTRACT[network],
        address: tkn.address,
        decimals: tkn.decimals,
        symbol: tkn.symbol,
        name: "",
        // name: zilswapToken.name,
        balance: undefined,
        allowances: {},
        pool: sdk!.getPool(tkn.address) || undefined,
        blockchain: Blockchain.Zilliqa,
      }
      return acc
    }, {} as SimpleMap<TokenInfo>)

    // load wrapper mappings and eth tokens by fetching bridge list from tradehub
    const host = network === Network.MainNet ? 'tradescan.switcheo.org' : 'dev-tradescan.switcheo.org'
    const mappings: WrapperMappingsResult = yield call(fetchJSON, `https://${host}/coin/wrapper_mappings`)
    const data: TradeHubTokensResult = yield call(fetchJSON, `https://${host}/coin/tokens`)
    const result: BridgeMappingResult = { [Blockchain.Zilliqa]: [] , [Blockchain.Ethereum]: [] }
    Object.entries(mappings.result).forEach(([wrappedDenom, sourceDenom]) => {
      const wrappedToken = data.result.find(d => d.denom === wrappedDenom)!
      const sourceToken = data.result.find(d => d.denom === sourceDenom)!
      if ((wrappedToken.blockchain !== Blockchain.Zilliqa && wrappedToken.blockchain !== Blockchain.Ethereum) ||
        (sourceToken.blockchain !== Blockchain.Zilliqa && sourceToken.blockchain !== Blockchain.Ethereum)) {
        return
      }
      addToken(tokens, sourceToken)
      addToken(tokens, wrappedToken)
      addMapping(result, wrappedToken, sourceToken)
      addMapping(result, sourceToken, wrappedToken)
    })

    yield put(actions.Bridge.setTokens(result))
    yield put(actions.Token.init({ tokens }));
    yield put(actions.Wallet.update({ wallet }))
    if (network !== prevNetwork) yield put(actions.Blockchain.setNetwork(network))

    // preventing teardown due to zap api error
    try {
      if (wallet) {
        const result: PoolTransactionResult = yield call(ZAPStats.getPoolTransactions, {
          network: network,
          address: wallet.addressInfo.bech32,
          per_page: 50,
        });
        const transactions: Transaction[] = result.records.map(
          (tx: PoolTransaction) => ({
            hash: tx.transaction_hash,
            status: "confirmed",
          })
        )

        yield put(actions.Transaction.init({ transactions }))
      } else {
        yield put(actions.Transaction.init({ transactions: [] }))
      }
    } catch (err) {
      console.error(err)
      // set to empty transactions when zap api failed
      yield put(actions.Transaction.init({ transactions: [] }))
    }

    yield put(actions.Token.refetchState());
    yield put(actions.Blockchain.initialized());
  } catch (err) {
    console.error(err)
    sdk = yield call(teardown, sdk)
  } finally {
    yield put(actions.Layout.removeBackgroundLoading('INIT_CHAIN'))
  }
  return sdk
}

function* teardown(sdk: Zilswap | null) {
  if (sdk) {
    yield call([sdk, sdk.teardown])
    ZilswapConnector.setSDK(null)
  }
  return null
}

function* watchInitialize() {
  const txChannel: Channel<TxObservedPayload> = channel()
  const stateChannel: Channel<StateChangeObservedPayload> = channel()
  let sdk: Zilswap | null = null;
  try {
    yield takeEvery(txChannel, txObserved)
    yield takeEvery(stateChannel, stateChangeObserved)
    while (true) {
      const action: ChainInitAction = yield take(actions.Blockchain.BlockchainActionTypes.CHAIN_INIT)
      sdk = yield call(teardown, sdk)
      sdk = yield call(initialize, action, txChannel, stateChannel)
    }
  } finally {
    txChannel.close()
    stateChannel.close()
  }
}

function* watchZilPay() {
  let chan
  while (true) {
    try {
      const action: WalletAction = yield take(WalletActionTypes.WALLET_UPDATE)
      if (action.payload.wallet?.type === WalletConnectType.ZilPay) {
        logger('starting to watch zilpay')
        const zilPay = (yield call(getConnectedZilPay)) as unknown as any;
        chan = (yield call(zilPayObserver, zilPay)) as EventChannel<ConnectedWallet>;
        break
      }
    } catch (e) {
      console.warn('Watch Zilpay failed, will automatically retry on reconnect. Error:')
      console.warn(e)
    }
  }
  try {
    while (true) {
      const newWallet = (yield take(chan)) as ConnectedWallet
      const { wallet: oldWallet } = getWallet(yield select())
      if (oldWallet?.type !== WalletConnectType.ZilPay) continue
      if (newWallet.addressInfo.bech32 === oldWallet?.addressInfo.bech32 &&
        newWallet.network === oldWallet.network) continue
      yield put(actions.Blockchain.initialize({ wallet: newWallet, network: newWallet.network }))
    }
  } finally {
    if (yield cancelled()) {
      chan.close()
    }
  }
}

export default function* blockchainSaga() {
  logger("init blockchain saga");
  yield fork(watchInitialize);
  yield fork(watchZilPay);
  yield put(actions.Blockchain.ready())
}
