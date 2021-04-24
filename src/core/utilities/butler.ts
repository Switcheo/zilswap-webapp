import { Value } from "@zilliqa-js/contract";
import { actions } from "app/store";
import {
  LayoutState,
  RootState,
  TokenInfo,
  Transaction,
  WalletState,
} from "app/store/types";
import { useAsyncTask } from "app/utils";
import {
  DefaultFallbackNetwork,
  LocalStorageKeys,
  ZilPayNetworkMap,
  ZIL_TOKEN_NAME,
} from "app/utils/constants";
import {
  connectWalletPrivateKey,
  ConnectWalletResult,
  connectWalletZeeves,
  connectWalletZilPay,
} from "core/wallet";
import { ZilswapConnector } from "core/zilswap";
import { ZWAPRewards } from "core/zwap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { ObservedTx, TokenDetails, TxReceipt, TxStatus } from "zilswap-sdk";
import { Network } from "zilswap-sdk/lib/constants";
import { logger } from "./logger";
import { PoolTransaction, ZAPStats } from "./zap-stats";

/**
 * Component constructor properties for {@link AppButler}
 *
 */
export type AppButlerProps = {};

/**
 * Convert token representation from zilswap-sdk's {@link TokenDetails}
 * to application's {@link TokenInfo}
 *
 * @param zilswapToken token representation from zilswap-sdk
 * @returns mapped {@link TokenInfo} representation of the token.
 */
const mapZilswapToken = (
  zilswapToken: TokenDetails,
  network: Network = DefaultFallbackNetwork
): TokenInfo => {
  return {
    initialized: false,
    registered: zilswapToken.registered,
    whitelisted: zilswapToken.whitelisted,
    isZil: zilswapToken.address === ZIL_TOKEN_NAME,
    isZwap: zilswapToken.address === ZWAPRewards.TOKEN_CONTRACT[network],
    address: zilswapToken.address,
    decimals: zilswapToken.decimals,
    symbol: zilswapToken.symbol,
    name: "",
    // name: zilswapToken.name,
    balance: undefined,
    balances: {},
    allowances: {},
    pool: ZilswapConnector.getPool(zilswapToken.address) || undefined
  };
};

/**
 * Converts `Value[]` array to map of string values.
 * `Value.type` is ignored, all values are returned as string.
 *
 *
 * sample input:
 * ```javascript
 *  [{
 *    name: "address",
 *    type: "ByStr20",
 *    value: "0xbadbeef",
 *  }, {
 *    name: "balance",
 *    type: "UInt28",
 *    value: "100000000",
 *  }]
 * ```
 *
 * output:
 * ```javascript
 *  {
 *    address: "0xbadbeef",
 *    balance: "100000000",
 *  }
 * ```
 *
 * @param params parameters in `Value[]` array representation
 * @returns mapped object representation - refer to sample output
 */
export const zilParamsToMap = (params: Value[]): { [index: string]: any } => {
  const output: { [index: string]: any } = {};
  for (const set of params) output[set.vname] = set.value;
  return output;
};

// eslint-disable-next-line
let mounted = false;
let zilPayWatcherSubscribed = false;
/**
 * Helper service to run continuous update or polling tasks
 * in the background.
 *
 * *init*:
 *  - initialize TokenState tokens in existing pools on zilswap contract.
 *  - append pseudo-token ZIL for UI implementation convenience.
 *
 */
export const AppButler: React.FC<AppButlerProps> = (props: AppButlerProps) => {
  const walletState = useSelector<RootState, WalletState>(
    (state) => state.wallet
  );
  const layoutState = useSelector<RootState, LayoutState>(
    (state) => state.layout
  );
  const store = useStore();
  const [zilswapReady, setZilswapReady] = useState(false);
  const [runInitWallet] = useAsyncTask<void>("initWallet");
  const [runInitZilswap] = useAsyncTask<void>("initZilswap");
  const [runReloadTransactions] = useAsyncTask<void>("reloadTransactions");
  const dispatch = useDispatch();

  const registerObserver = () => {
    ZilswapConnector.registerObserver(
      (tx: ObservedTx, status: TxStatus, receipt?: TxReceipt) => {
        logger("butler observed tx", tx.hash, status);

        dispatch(
          actions.Transaction.update({
            hash: tx.hash,
            status: status,
            txReceipt: receipt,
          })
        );

        // refetch all token states if updated TX is currently
        // recorded within state
        const transactions: Transaction[] = store.getState().transaction
          .transactions;
        if (transactions.find((transaction) => transaction.hash === tx.hash))
          dispatch(actions.Token.updateState());
      }
    );
  };

  const clearObserver = () => {
    ZilswapConnector.registerObserver(null);
  };

  const getConnectedZilPay = async () => {
    const zilPay = (window as any).zilPay;
    try {
      if (typeof zilPay !== "undefined") {
        const result = await zilPay.wallet.connect();
        if (result === zilPay.wallet.isConnect) {
          return zilPay;
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getConnectedZeeves = async() => {
    const zeeves = (window as any).Zeeves;
    try {
      if (typeof zeeves !== "undefined") {
        const result = await zeeves.getSession();
        if (result) {
          return zeeves;
        }
      }
    } catch (e) {
      console.error('Error when connecting Zeeves - ' + (e && e.stack ? e.stack : JSON.stringify(e)));
    }
  }

  const watchZilPayAccount = (zilPay: any) => {
    if (!zilPay || zilPayWatcherSubscribed) return;

    const accountObserver = zilPay.wallet.observableAccount();
    const networkObserver = zilPay.wallet.observableNetwork();
    accountObserver.subscribe((account: any) => {
      const walletState: WalletState = store.getState().wallet;
      // ignore account change if not connected
      if (!walletState.zilpay) return;

      // re-initialise if account changed
      if (walletState.wallet?.addressInfo.bech32 !== account.bech32) {
        // ZilPay unsubscribes doesnt work
        // accountObserver.unsubscribe();
        // networkObserver.unsubscribe();
        initWithZilPay();
      }
    });
    networkObserver.subscribe(async (net: string) => {
      const walletState: WalletState = store.getState().wallet;
      // ignore account change if not connected
      if (!walletState.zilpay) return;

      const network = ZilPayNetworkMap[net];

      if (!network) {
        // unregistered network
        // run init to handle undefined network
        initWithZilPay();
        return;
      }

      if (network !== ZilswapConnector.network) {
        initWithZilPay();
      }
    });

    zilPayWatcherSubscribed = true;
  };

  const initTokens = () => {
    logger("init tokens")
    const zilswapTokens = ZilswapConnector.getTokens();
    const network = ZilswapConnector.network;

    const tokens: { [index: string]: TokenInfo } = {};
    zilswapTokens
      .map((token) => mapZilswapToken(token, network))
      // uncomment to test create pool
      // .filter(token => token.address !== "zil10a9z324aunx2qj64984vke93gjdnzlnl5exygv")
      .forEach((token) => (tokens[token.address] = token));

    // initialize store TokenState
    dispatch(actions.Token.init({ tokens }));
  };

  const initZilswap = () => {
    logger("butler", "initZilswap");
    runInitZilswap(async () => {
      initTokens();
      setZilswapReady(true);
    });
  };

  const initWithPrivateKey = (privateKey: string) => {
    logger("butler", "initWithPrivateKey");
    runInitWallet(async () => {
      let walletResult: ConnectWalletResult | undefined;

      try {
        walletResult = await connectWalletPrivateKey(privateKey);
      } catch (e) {}

      const storeState: RootState = store.getState();
      if (walletResult?.wallet) {
        const { wallet } = walletResult;

        await ZilswapConnector.connect({
          wallet,
          network: storeState.layout.network,
          observedTxs: storeState.transaction.observingTxs,
        });
        dispatch(actions.Wallet.update({ wallet, privateKey }));
      } else {
        await ZilswapConnector.initialise({
          network: storeState.layout.network,
        });
        dispatch(
          actions.Wallet.update({
            wallet: undefined,
            privateKey: undefined,
            zilpay: undefined,
          })
        );
      }

      initZilswap();
    });
  };

  const processWalletResult = async (walletResult: ConnectWalletResult | undefined) => {
    const storeState: RootState = store.getState();
    if (walletResult?.wallet) {
      const { wallet } = walletResult;
      const { network } = wallet;
      await ZilswapConnector.connect({
        wallet,
        network,
        observedTxs: storeState.transaction.observingTxs,
      });
      dispatch(actions.Layout.updateNetwork(network));
      dispatch(actions.Wallet.update({ wallet, zilpay: true }));
    } else {
      await ZilswapConnector.initialise({
        network: storeState.layout.network,
      });
      dispatch(
        actions.Wallet.update({
          wallet: undefined,
          privateKey: undefined,
          zilpay: undefined,
        })
      );
    }

    initZilswap();
  }

  const initWithZeeves = () => {
    logger("butler", "initWithZeeves");
    runInitWallet(async () => {
      let walletResult: ConnectWalletResult | undefined;
      const zeeves = await getConnectedZeeves();
      if (zeeves) {
        try {
          walletResult = await connectWalletZeeves(zeeves);
        } catch (e) {
          dispatch(
            actions.Layout.updateNotification({
              type: "",
              message: e.message,
            })
          );
        }
      }
      await processWalletResult(walletResult);
    });
  }

  const initWithZilPay = () => {
    logger("butler", "initWithZilPay");
    runInitWallet(async () => {
      let walletResult: ConnectWalletResult | undefined;
      const zilPay = await getConnectedZilPay();
      if (zilPay) {
        try {
          walletResult = await connectWalletZilPay(zilPay);
          watchZilPayAccount(zilPay);
        } catch (e) {
          dispatch(
            actions.Layout.updateNotification({
              type: "",
              message: e.message,
            })
          );
        }
      }
      await processWalletResult(walletResult);
    });
  };

  const initWithoutWallet = () => {
    logger("butler", "initWithoutWallet");
    runInitWallet(async () => {
      const storeState: RootState = store.getState();
      await ZilswapConnector.initialise({
        network: storeState.layout.network,
      });
      dispatch(
        actions.Wallet.update({
          wallet: undefined,
          privateKey: undefined,
          zilpay: undefined,
        })
      );

      initZilswap();
    });
  };

  useEffect(() => {
    logger("butler mount");
    registerObserver();

    const privateKey = localStorage.getItem(LocalStorageKeys.PrivateKey);
    const savedZilpay = localStorage.getItem(LocalStorageKeys.ZilPayConnected);
    const savedZeeves = localStorage.getItem(LocalStorageKeys.ZeevesConnected);

    if (typeof privateKey === "string") {
      initWithPrivateKey(privateKey);
    } else if (savedZilpay === "true") {
      initWithZilPay();
    } else if (savedZeeves === "true") {
      initWithZeeves();
    } else {
      initWithoutWallet();
    }

    mounted = true;
    return () => {
      mounted = false;
      clearObserver();
    };

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    logger("butler", "zilswapReady", {
      zilswapReady,
      wallet: walletState.wallet,
      zilpay: walletState.zilpay,
    });
    if (!zilswapReady) return;

    if (walletState.wallet) {
      if (walletState.zilpay) {
        watchZilPayAccount(walletState.wallet.provider);
      }

      runReloadTransactions(async () => {
        if (!walletState.wallet) return;
        const { records } = await ZAPStats.getPoolTransactions({
          network: ZilswapConnector.network!,
          address: walletState.wallet!.addressInfo.bech32,
          per_page: 50,
        });
        const transactions: Transaction[] = records.map(
          (tx: PoolTransaction) => ({
            hash: tx.transaction_hash,
            status: "confirmed",
          })
        );

        dispatch(actions.Transaction.init({ transactions }));
      });
    } else {
      dispatch(actions.Transaction.init({ transactions: [] }));
    }

    dispatch(actions.Token.updateState());
    // eslint-disable-next-line
  }, [zilswapReady, walletState.wallet]);

  useEffect(() => {
    logger("butler", "network change");
    if (zilswapReady) initTokens();

    // eslint-disable-next-line
  }, [layoutState.network]);

  return null;
};
