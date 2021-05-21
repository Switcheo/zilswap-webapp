import { ConnectedWallet, WalletConnectType } from "core/wallet";
import { actions } from "app/store";
import { ChainInitAction } from "app/store/blockchain/actions";
import { Transaction, TokenInfo } from "app/store/types";
import { RPCEndpoints, ZIL_TOKEN_NAME } from "app/utils/constants";
import { ZILO_DATA } from "core/zilo/constants";
import { ZWAPRewards } from "core/zwap";
import { ZilswapConnector } from "core/zilswap";
import { connectWalletZilPay } from "core/wallet";
import { logger } from "core/utilities";
import { getConnectedZilPay } from "core/utilities/zilpay";
import { PoolTransaction, PoolTransactionResult, ZAPStats } from "core/utilities/zap-stats";
import { eventChannel, EventChannel } from "redux-saga";
import { fork, call, put, select, take, cancelled } from "redux-saga/effects";
import { AppState, ObservedTx, TxReceipt, TxStatus, Zilswap } from "zilswap-sdk";
import { getWallet, getTransactions } from '../selectors'

const getProviderOrKeyFromWallet = (wallet: ConnectedWallet | null) => {
  if (!wallet) return undefined;

  switch (wallet.type) {
    case WalletConnectType.PrivateKey:
      return wallet.addressInfo.privateKey
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

function* txObserver(tx: ObservedTx, status: TxStatus, receipt?: TxReceipt) {
  logger('observedtx', tx)

  yield put(actions.Rewards.removePendingClaimTx(tx.hash));
  yield put(actions.Transaction.update({ hash: tx.hash, status: status, txReceipt: receipt }));

  // refetch all token states if updated TX is currently recorded within state
  const { transactions } = getTransactions(yield select());
  if (transactions.find((transaction: Transaction) => transaction.hash === tx.hash)){
    yield put(actions.Token.updateState());
  }
}

function* ziloStateObserver() {

}

function* initialize(action: ChainInitAction) {
  let sdk: Zilswap | null = null;
  try {
    yield put(actions.Layout.addBackgroundLoading('initChain', 'INIT_CHAIN'))

    const { network, wallet } = action.payload
    const providerOrKey = getProviderOrKeyFromWallet(wallet)
    const { observingTxs } = getTransactions(yield select());

    sdk = new Zilswap(network, providerOrKey, { rpcEndpoint: RPCEndpoints[network] });
    logger('sdk initialized')

    yield call([sdk, sdk.initialize], txObserver, observingTxs)
    for (let i = 0; i++; i < ZILO_DATA[network].length) {
      const data = ZILO_DATA[network][i]
      const zilo = sdk.initZilo(data.contractAddress)
      yield call([zilo, zilo.initialize], ziloStateObserver)
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
    yield put(actions.Blockchain.setNetwork(network))
    yield put(actions.Wallet.update({ wallet }))

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

    yield put(actions.Token.updateState());
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
  let sdk: Zilswap | null = null;
  while (true) {
    const action: ChainInitAction = yield take(actions.Blockchain.BlockchainActionTypes.CHAIN_INIT)
    sdk = yield call(teardown, sdk)
    sdk = yield call(initialize, action)
  }
}

function* watchZilPay() {
  const zilPay = yield call(getConnectedZilPay);
  const chan = (yield call(zilPayObserver, zilPay)) as EventChannel<ConnectedWallet>;
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
}
