
import { channel, Channel, eventChannel, EventChannel } from "redux-saga";
import { fork, call, put, select, take, takeEvery, cancelled } from "redux-saga/effects";
import { AppState, ObservedTx, TxReceipt, TxStatus, Zilswap } from "zilswap-sdk";
import { ZiloAppState } from "zilswap-sdk/lib/zilo"

import { actions } from "app/store";
import { ChainInitAction } from "app/store/blockchain/actions";
import { WalletAction, WalletActionTypes } from "app/store/wallet/actions";
import { Transaction, TokenInfo } from "app/store/types";
import { RPCEndpoints, ZIL_TOKEN_NAME } from "app/utils/constants";
import { connectWalletZilPay, ConnectedWallet, WalletConnectType } from "core/wallet";
import { ZILO_DATA } from "core/zilo/constants";
import { ZWAPRewards } from "core/zwap";
import { ZilswapConnector } from "core/zilswap";
import { logger } from "core/utilities";
import { getConnectedZilPay } from "core/utilities/zilpay";
import { PoolTransaction, PoolTransactionResult, ZAPStats } from "core/utilities/zap-stats";
import { getBlockchain, getWallet, getTransactions } from '../selectors'
import { detachedToast } from "app/utils/useToaster";

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
    const tokens: { [index: string]: TokenInfo } = Object.keys(zilswapTokens).reduce((acc, addr) => {
      const tkn = zilswapTokens[addr]
      acc[tkn.address] = {
        initialized: false,
        registered: tkn.registered,
        whitelisted: tkn.whitelisted,
        isZil: tkn.address === ZIL_TOKEN_NAME,
        isZwap: tkn.address === ZWAPRewards.TOKEN_CONTRACT[network],
        address: tkn.address,
        decimals: tkn.decimals,
        symbol: tkn.symbol,
        name: "",
        // name: zilswapToken.name,
        balance: undefined,
        balances: {},
        allowances: {},
        pool: sdk!.getPool(tkn.address) || undefined
      }
      return acc
    }, {} as { [index: string]: TokenInfo })

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
    } catch (error) {
      // set to empty transactions when zap api failed 
      yield put(actions.Transaction.init({ transactions: [] }))
    }

    yield put(actions.Token.refetchState());
    yield put(actions.Blockchain.initialized());
  } catch (error) {
    console.error(error)
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
