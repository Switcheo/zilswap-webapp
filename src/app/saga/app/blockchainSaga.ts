
import { Channel, EventChannel, channel, eventChannel } from "redux-saga";
import { call, cancelled, fork, put, select, take, takeEvery } from "redux-saga/effects";
import { AppState, ObservedTx, TxReceipt, TxStatus, Zilswap } from "zilswap-sdk";
import { ZiloAppState } from "zilswap-sdk/lib/zilo"

import { Blockchain, CarbonSDK } from "carbon-js-sdk";
import { Token as CarbonToken } from "carbon-js-sdk/lib/codec";
import { blockchainForChainId } from "carbon-js-sdk/lib/util/blockchain";
import { ConnectedWallet, WalletConnectType, connectWalletBoltX, connectWalletZilPay } from "core/wallet";
import { ZILO_DATA } from "core/zilo/constants";
import { ZilswapConnector, toBech32Address } from "core/zilswap";
import { ZWAP_TOKEN_CONTRACT } from "core/zilswap/constants";
import { logger } from "core/utilities";
import { getConnectedZilPay } from "core/utilities/zilpay";
import { PoolTransaction, PoolTransactionResult, ZAPStats } from "core/utilities/zap-stats";
import { ConnectedBridgeWallet } from "core/wallet/ConnectedBridgeWallet";
import { getConnectedBoltX } from "core/utilities/boltx";
import { netZilToCarbon, SimpleMap } from "app/utils";
import { BridgeableToken } from "app/store/bridge/types";
import { detachedToast } from "app/utils/useToaster";
import { BRIDGEABLE_WRAPPED_DENOMS, BoltXNetworkMap, RPCEndpoints, ZIL_ADDRESS, WZIL_TOKEN_CONTRACT } from "app/utils/constants";
import { TokenInfo, Transaction } from "app/store/types";
import { BridgeWalletAction, WalletAction, WalletActionTypes } from "app/store/wallet/actions";
import { ChainInitAction } from "app/store/blockchain/actions";
import { actions } from "app/store";
import { StatsActionTypes } from "app/store/stats/actions";
import { getBlockchain, getTransactions, getWallet } from '../selectors'

const getProviderOrKeyFromWallet = (wallet: ConnectedWallet | null) => {
  if (!wallet) return null;

  switch (wallet.type) {
    case WalletConnectType.PrivateKey:
      return wallet.addressInfo.privateKey
    case WalletConnectType.Zeeves:
    case WalletConnectType.ZilPay:
    case WalletConnectType.BoltX:
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

const boltXObserver = (boltX: any) => {

  return eventChannel<ConnectedWallet>(emitter => {
    const accountSubscription = async (account: any) => {
      if (account) {
        logger(`BoltX account changed to: ${account.bech32}`)
        const walletResult = await connectWalletBoltX(boltX);
        if (walletResult?.wallet) {
          emitter(walletResult.wallet)
        }
      } else {
        logger(`BoltX disconnected`)
        put(actions.Blockchain.initialize({ wallet: null, network: BoltXNetworkMap[boltX.zilliqa.wallet.net] }));
      }
    };

    const networkSubscription = async (net: string) => {
      logger(`BoltX network changed to: ${net}`)
      const walletResult = await connectWalletBoltX(boltX);
      if (walletResult?.wallet) {
        emitter(walletResult.wallet)
      }
    };

    const { ACCOUNT_CHANGED, NETWORK_CHANGED } = boltX.zilliqa.wallet.events;
    boltX.zilliqa.wallet.on(ACCOUNT_CHANGED, accountSubscription);
    boltX.zilliqa.wallet.on(NETWORK_CHANGED, networkSubscription);
    logger('registered boltX observer')

    return () => {
      logger('deregistered boltX observer')
      boltX.zilliqa.wallet.off(ACCOUNT_CHANGED, accountSubscription);
      boltX.zilliqa.wallet.off(NETWORK_CHANGED, networkSubscription);
    }
  })

}

const web3Observer = (wallet: ConnectedBridgeWallet) => {
  return eventChannel<ConnectedBridgeWallet>(emitter => {
    const provider = wallet.provider
    provider.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length > 0) {
        emitter({
          provider: provider,
          address: accounts[0],
          chainId: wallet.chainId
        })
      }
    })

    provider.on("chainChanged", (chainId: number) => {
      emitter({
        provider: provider,
        address: wallet.address,
        chainId: chainId
      })
    })

    logger('registered web3 observer')

    return () => {
      logger('deregistered web3 observer')
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

  yield put(actions.Transaction.update({ hash: tx.hash, status: status, txReceipt: receipt }));

  detachedToast(`Transaction ${status ? status : "confirmed"}`, { hash: tx.hash });

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

interface BridgeMappingResult {
  [Blockchain.Zilliqa]: BridgeableToken[],
  [Blockchain.Ethereum]: BridgeableToken[],
};

const addMapping = (r: BridgeMappingResult, a: CarbonToken, b: CarbonToken, sourceChain: Blockchain) => {
  const aChain = blockchainForChainId(a.chainId.toNumber()) as Blockchain.Zilliqa | Blockchain.Ethereum;
  const bChain = blockchainForChainId(b.chainId.toNumber()) as Blockchain.Zilliqa | Blockchain.Ethereum;
  r[aChain].push({
    blockchain: aChain,
    tokenAddress: a.tokenAddress.toLowerCase(),
    lockproxyAddress: a.bridgeAddress,
    denom: a.denom,
    tokenId: a.id,
    toBlockchain: bChain,
    toTokenAddress: b.tokenAddress.toLowerCase(),
    toDenom: b.denom,
    toTokenId: b.id,
    balDenom: sourceChain === aChain ? a.denom : b.denom,
  })
}

const addToken = (r: SimpleMap<TokenInfo>, t: CarbonToken) => {
  const blockchain = blockchainForChainId(t.chainId.toNumber());
  const address = blockchain === Blockchain.Zilliqa ? toBech32Address(t.tokenAddress) : `0x${t.tokenAddress.toLowerCase()}`
  if (r[address]) {
    if (!r[address].registered)
      r[address].registered = true;
    return
  }
  r[address] = {
    initialized: false,
    registered: true,
    whitelisted: false,
    isWzil: false,
    isZil: false,
    isZwap: false,
    address,
    decimals: t.decimals.toNumber(),
    symbol: t.symbol,
    name: `${t.name} (${t.denom})`,
    balance: undefined,
    allowances: {},
    pool: undefined,
    blockchain,
  }
}

function* initialize(action: ChainInitAction, txChannel: Channel<TxObservedPayload>, stateChannel: Channel<StateChangeObservedPayload>) {
  let sdk: Zilswap | null = null;
  try {
    const { wallet: prevWallet } = getWallet(yield select());
    yield put(actions.Layout.addBackgroundLoading('initChain', 'INIT_CHAIN'))
    yield put(actions.Wallet.update({ wallet: null }))

    const { network, wallet } = action.payload
    const providerOrKey = getProviderOrKeyFromWallet(wallet)
    const { observingTxs } = getTransactions(yield select());
    const { network: prevNetwork } = getBlockchain(yield select());

    logger('init chain zilswap sdk')
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

    logger('init chain load tokens')
    // load tokens
    const appState: AppState = yield call([sdk, sdk.getAppState]);
    const zilswapTokens = appState.tokens
    const tokens: SimpleMap<TokenInfo> = Object.keys(zilswapTokens).reduce((acc, addr) => {
      const tkn = zilswapTokens[addr]
      acc[tkn.address] = {
        initialized: false,
        registered: tkn.registered,
        whitelisted: tkn.whitelisted,
        isWzil: tkn.address === WZIL_TOKEN_CONTRACT[network],
        isZil: tkn.address === ZIL_ADDRESS,
        isZwap: tkn.address === ZWAP_TOKEN_CONTRACT[network],
        address: tkn.address,
        decimals: tkn.decimals,
        symbol: tkn.symbol,
        name: tkn.name,
        balance: undefined,
        allowances: {},
        pool: sdk!.getPool(tkn.address) || undefined,
        blockchain: Blockchain.Zilliqa,
      }
      return acc
    }, {} as SimpleMap<TokenInfo>)

    const bridgeTokenResult: BridgeMappingResult = { [Blockchain.Zilliqa]: [], [Blockchain.Ethereum]: [] }

    try {
      // load wrapper mappings and eth tokens by fetching bridge list from carbon
      const carbonSdk: CarbonSDK = yield call(CarbonSDK.instance, {
        network: netZilToCarbon(network),
      });
      const mappings = carbonSdk.token.wrapperMap;
      const carbonTokens: CarbonToken[] = Object.values(carbonSdk.token.tokens);
      const bridgeableDenoms = BRIDGEABLE_WRAPPED_DENOMS[network];
      Object.entries(mappings).forEach(([wrappedDenom, sourceDenom]) => {
        if (!bridgeableDenoms.includes(wrappedDenom)) {
          return;
        }
  
        const wrappedToken = carbonTokens.find(d => d.denom === wrappedDenom)!
        const sourceToken = carbonTokens.find(d => d.denom === sourceDenom)!
  
        const wrappedChain = blockchainForChainId(wrappedToken.chainId.toNumber());
        const sourceChain = blockchainForChainId(sourceToken.chainId.toNumber());
  
        if ((wrappedChain !== Blockchain.Zilliqa && wrappedChain !== Blockchain.Ethereum) ||
          (sourceChain !== Blockchain.Zilliqa && sourceChain !== Blockchain.Ethereum)) {
          return
        }
        addToken(tokens, sourceToken)
        addToken(tokens, wrappedToken)
        addMapping(bridgeTokenResult, wrappedToken, sourceToken, sourceChain)
        addMapping(bridgeTokenResult, sourceToken, wrappedToken, sourceChain)
      })
    } catch (error) {
      console.error("could not load bridge tokens");
      console.error(error);
    }

    logger('init chain set tokens')
    yield put(actions.Bridge.setTokens(bridgeTokenResult))
    yield put(actions.Token.init({ tokens }));
    yield put(actions.Wallet.update({ wallet }));

    if (wallet?.addressInfo.bech32 !== prevWallet?.addressInfo.bech32) {
      yield put(actions.MarketPlace.removeAccessToken());
    }

    if (network !== prevNetwork) {
      yield put(actions.Blockchain.setNetwork(network));
      yield put(actions.MarketPlace.removeAccessToken());
    }

    yield put(actions.Stats.reloadPoolTx());

    logger('init chain refetch state')
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

function* watchReloadPoolTx() {
  while (true) {
    try {
      yield take(StatsActionTypes.RELOAD_POOL_TX)
      const { wallet } = getWallet(yield select());
      const { network } = getBlockchain(yield select());
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
  }
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

function* watchBoltX() {
  let chan
  while (true) {
    try {
      const action: WalletAction = yield take(WalletActionTypes.WALLET_UPDATE)
      if (action.payload.wallet?.type === WalletConnectType.BoltX) {
        logger('starting to watch boltx')
        const boltX = (yield call(getConnectedBoltX)) as unknown as any;
        chan = (yield call(boltXObserver, boltX)) as EventChannel<ConnectedWallet>;
        break
      }
    } catch (e) {
      console.warn('Watch BoltX failed, will automatically retry on reconnect. Error:')
      console.warn(e)
    }
  }
  try {
    while (true) {
      const newWallet = (yield take(chan)) as ConnectedWallet
      const { wallet: oldWallet } = getWallet(yield select())
      if (oldWallet?.type !== WalletConnectType.BoltX) continue
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

function* watchWeb3() {
  let chan
  while (true) {
    try {
      const action: BridgeWalletAction = yield take(WalletActionTypes.SET_BRIDGE_WALLET)
      if (action.payload.wallet) {
        logger('starting to watch web3')
        chan = (yield call(web3Observer, action.payload.wallet)) as EventChannel<ConnectedBridgeWallet>;
        break
      }
    } catch (e) {
      console.warn('Watch web3 failed, will automatically retry to reconnect. Error:')
      console.warn(e)
    }
  }
  try {
    while (true) {
      const newWallet = (yield take(chan)) as ConnectedBridgeWallet
      yield put(actions.Wallet.setBridgeWallet({ blockchain: Blockchain.Ethereum, wallet: newWallet }))
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
  yield fork(watchReloadPoolTx);
  yield fork(watchZilPay);
  yield fork(watchBoltX);
  yield fork(watchWeb3)
  yield put(actions.Blockchain.ready())
}
