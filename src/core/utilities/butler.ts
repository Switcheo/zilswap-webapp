import { Value } from "@zilliqa-js/contract";
import { actions } from "app/store";
import { LayoutState, RootState, TokenBalanceMap, TokenInfo, TokenState, Transaction, WalletState } from "app/store/types";
import { useAsyncTask } from "app/utils";
import { LocalStorageKeys, ZIL_TOKEN_NAME } from "app/utils/contants";
import { connectWalletPrivateKey, ConnectWalletResult, connectWalletZilPay, parseBalanceResponse } from "core/wallet";
import { BN, getAllowancesMap, getBalancesMap, RPCResponse, ZilswapConnector } from "core/zilswap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { ObservedTx, TokenDetails, TxReceipt, TxStatus } from "zilswap-sdk";
import { ViewBlock } from "./viewblock";

/**
 * Component constructor properties for {@link AppButler}
 *
 */
export type AppButlerProps = {
};

/**
 * Convert token representation from zilswap-sdk's {@link TokenDetails}
 * to application's {@link TokenInfo}
 *
 * @param zilswapToken token representation from zilswap-sdk
 * @returns mapped {@link TokenInfo} representation of the token.
 */
const mapZilswapToken = (zilswapToken: TokenDetails): TokenInfo => {
  return {
    initialized: false,
    whitelisted: zilswapToken.whitelisted,
    isZil: zilswapToken.address === ZIL_TOKEN_NAME,
    dirty: false,
    address: zilswapToken.address,
    decimals: zilswapToken.decimals,
    symbol: zilswapToken.symbol,
    name: "",
    balance: new BN(0),
    init_supply: new BN(0),
    balances: {},
    allowances: {},
  }
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
  for (const set of params)
    output[set.vname] = set.value;
  return output;
};

// eslint-disable-next-line
let mounted = false;
/**
 * Helper service to run continuous update or polling tasks
 * in the background.
 *
 * *init*:
 *  - initialize TokenState tokens in existing pools on zilswap contract.
 *  - append pseudo-token ZIL for UI implementation convenience.
 *
 * *update*:
 *  - listens to changes in tokens and loads token metadata (pool, balances, etc)
 * for tokens with `initialized` set to `false`.
 *
 */
export const AppButler: React.FC<AppButlerProps> = (props: AppButlerProps) => {
  const walletState = useSelector<RootState, WalletState>(state => state.wallet);
  const layoutState = useSelector<RootState, LayoutState>(state => state.layout);
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const store = useStore();
  const [zilswapReady, setZilswapReady] = useState(false);
  const [runQueryToken] = useAsyncTask<void>("queryTokenInfo");
  const [runInitWallet] = useAsyncTask<void>("initWallet");
  const [runInitZilswap] = useAsyncTask<void>("initZilswap");
  const [runReloadTransactions] = useAsyncTask<void>("reloadTransactions");
  const dispatch = useDispatch();

  const registerObserver = () => {
    ZilswapConnector.registerObserver((tx: ObservedTx, status: TxStatus, receipt?: TxReceipt) => {
      // console.log("butler observed tx", tx.hash, status);

      dispatch(actions.Transaction.update({
        hash: tx.hash,
        status: status,
        txReceipt: receipt,
      }));

      // invalidate all tokens if updated TX is currently
      // recorded within state
      const transactions: Transaction[] = store.getState().transaction.transactions;
      if (transactions.find(transaction => transaction.hash === tx.hash))
        dispatch(actions.Token.invalidate());
    });
  };

  const clearObserver = () => {
    ZilswapConnector.registerObserver(null);
  };

  const initTokens = () => {
    const zilswapTokens = ZilswapConnector.getTokens(); // test new pool: .filter(token => token.symbol !== "ITN");

    const tokens: { [index: string]: TokenInfo } = {};
    zilswapTokens.map(mapZilswapToken).forEach(token => tokens[token.address] = token);

    // // inject ZIL as a pseudo-token
    // // SDK provides a zil token from v0.0.11
    // tokens["zil"] = {
    //   isZil: true,
    //   dirty: false,
    //   initialized: false,
    //   listPriority: 0,
    //   address: ZIL_HASH,
    //   decimals: 12,
    //   balance: walletState.wallet?.balance || new BN(0),
    //   init_supply: new BN(0),
    //   name: "Zilliqa",
    //   symbol: "ZIL",
    //   balances: {},
    // };

    // initialize store TokenState
    dispatch(actions.Token.init({ tokens }));
  }

  const initZilswap = () => {
    // console.log("butler", "initZilswap");
    runInitZilswap(async () => {
      initTokens();
      setZilswapReady(true);
    });
  };

  const initWithPrivateKey = (privateKey: string) => {
    // console.log("butler", "initWithPrivateKey");
    runInitWallet(async () => {
      let walletResult: ConnectWalletResult | undefined;

      try {
        walletResult = await connectWalletPrivateKey(privateKey);
      } catch (e) { }

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
        dispatch(actions.Wallet.update({ wallet: undefined, privateKey: undefined, zilpay: undefined }));
      }

      initZilswap();
    });
  };

  const initWithZilPay = () => {
    // console.log("butler", "initWithZilPay");
    runInitWallet(async () => {
      let walletResult: ConnectWalletResult | undefined;
      const zilPay = (window as any).zilPay;
      try {
        if (typeof zilPay !== "undefined") {
          const result = await zilPay.wallet.connect();
          if (result === zilPay.wallet.isConnect) {
            walletResult = await connectWalletZilPay(zilPay);
          }
        }
      } catch (e) { }

      const storeState: RootState = store.getState();
      if (walletResult?.wallet) {
        const { wallet } = walletResult;

        await ZilswapConnector.connect({
          wallet,
          network: storeState.layout.network,
          observedTxs: storeState.transaction.observingTxs,
        });
        dispatch(actions.Wallet.update({ wallet, zilpay: true }));
      } else {
        await ZilswapConnector.initialise({
          network: storeState.layout.network,
        });
        dispatch(actions.Wallet.update({ wallet: undefined, privateKey: undefined, zilpay: undefined }));
      }

      initZilswap();
    });
  };

  const initWithoutWallet = () => {
    // console.log("butler", "initWithoutWallet");
    runInitWallet(async () => {
      const storeState: RootState = store.getState();
      await ZilswapConnector.initialise({
        network: storeState.layout.network,
      });
      dispatch(actions.Wallet.update({ wallet: undefined, privateKey: undefined, zilpay: undefined }));

      initZilswap();
    });
  };

  useEffect(() => {
    // console.log("butler mount");
    registerObserver();

    const privateKey = localStorage.getItem(LocalStorageKeys.PrivateKey);
    const savedZilpay = localStorage.getItem(LocalStorageKeys.ZilPayConnected);

    if (typeof privateKey === "string") {
      initWithPrivateKey(privateKey);
    } else if (savedZilpay === "true") {
      initWithZilPay();
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
    // console.log("butler", "zilswapReady", { zilswapReady, wallet: walletState.wallet });
    if (!zilswapReady) return;

    if (walletState.wallet) {
      runReloadTransactions(async () => {
        if (!walletState.wallet) return;
        const viewblockTxs = await ViewBlock.listTransactions({
          network: ZilswapConnector.network!.toLowerCase(),
          address: walletState.wallet!.addressInfo.bech32,
        });
        const transactions: Transaction[] = viewblockTxs.map((tx: any) => ({
          hash: tx.hash.replace(/^0x/, ""),
          status: "confirmed",
        }));

        dispatch(actions.Transaction.init({ transactions }));
      });
    } else {
      dispatch(actions.Transaction.init({ transactions: [] }));
    }

    dispatch(actions.Token.invalidate());
    // eslint-disable-next-line
  }, [zilswapReady, walletState.wallet]);

  useEffect(() => {
    // console.log("butler", "network change")
    if (zilswapReady) initTokens();

    // eslint-disable-next-line
  }, [layoutState.network])

  useEffect(() => {

    const tokens: TokenInfo[] = store.getState().token.tokens;
    for (const address in tokens) {
      const token = tokens[address];

      // skip initialized tokens to prevent run away
      // update cycle by useEffect.
      if (token.initialized && !token.dirty) continue;
      // console.log(`butler update:${token.symbol}`);

      // set initialized to true to prevent repeat execution
      // due to useEffect triggering.
      // set loading to true for UI implementations.
      dispatch(actions.Token.update({
        address,
        loading: true,
        dirty: false,
        initialized: true,
      }));

      runQueryToken(async () => {
        // zil is a pseudo token that should be updated through
        // updating the connected wallet.

        const walletAddress = walletState.wallet?.addressInfo.byte20;
        const lowerCaseWalletAddress = walletAddress?.toLowerCase() || "";
        if (token.isZil) {
          let balance: BN | undefined;
          if (walletAddress) {
            const balanceRPCResponse = await ZilswapConnector.getZilliqa().blockchain.getBalance(walletAddress);
            const balanceResult = parseBalanceResponse(balanceRPCResponse as RPCResponse<any, string>);
            balance = new BN(balanceResult.balance || 0);
          }

          // update token store
          dispatch(actions.Token.update({
            address,
            loading: false,
            balance: balance || new BN(0),
            balances: {
              ...balance && {
                // initialize with own wallet balance
                [walletState.wallet.addressInfo.byte20.toLowerCase()]: balance!,
              },
            },
          }));
          return;
        }

        // retrieve contract and init params
        const contract = ZilswapConnector.getZilliqa().contracts.at(address);
        const contractInitParams = await contract.getInit();
        const contractInit = zilParamsToMap(contractInitParams);

        // retrieve balances of each token owner
        const contractBalanceState = await getBalancesMap(contract);

        // map balance object from string values to BN values
        const balances: TokenBalanceMap = {};
        for (const address in contractBalanceState)
          balances[address] = new BN(contractBalanceState[address]);

        // retrieve token pool, if it exists
        const pool = ZilswapConnector.getPool(token.address) || undefined;

        const balance = balances[lowerCaseWalletAddress] || new BN(0);

        // retrieve allowances of each token owner
        const contractAllowancesMap = await getAllowancesMap(contract);
        const allowances = contractAllowancesMap[lowerCaseWalletAddress] || {};

        // prepare and dispatch token info update to store.
        const tokenInfo: TokenInfo = {
          initialized: true,
          dirty: false,
          loading: false,
          isZil: false,

          whitelisted: token.whitelisted,
          address: token.address,
          decimals: token.decimals,

          init_supply: new BN(contractInit.init_supply),
          symbol: contractInit.symbol,
          name: contractInit.name,

          balance, pool, balances, allowances,
        };
        dispatch(actions.Token.update(tokenInfo));
      });
    }

    // eslint-disable-next-line
  }, [tokenState.tokens]);

  return null;
};
