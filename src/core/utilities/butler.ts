import { Value } from "@zilliqa-js/contract";
import { actions } from "app/store";
import { RootState, TokenBalanceMap, TokenInfo, TokenState, Transaction, WalletState } from "app/store/types";
import { useAsyncTask } from "app/utils";
import { parseBalanceResponse } from "core/wallet";
import { BN, getBalancesMap, RPCResponse, ZilswapConnector } from "core/zilswap";
import React, { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { ObservedTx, TokenDetails, TxReceipt, TxStatus } from "zilswap-sdk";
import { Network, ZIL_HASH } from "zilswap-sdk/lib/constants";
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
    isZil: false,
    dirty: false,
    address: zilswapToken.address,
    decimals: zilswapToken.decimals,
    symbol: zilswapToken.symbol,
    name: "",
    balance: new BN(0),
    init_supply: new BN(0),
    balances: {},
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
  const tokenState = useSelector<RootState, TokenState>(state => state.token);
  const store = useStore();
  const [runQueryToken] = useAsyncTask<void>("queryTokenInfo");
  const [runInitZilswap] = useAsyncTask<void>("initZilswap");
  const [runReloadTransactions] = useAsyncTask<void>("reloadTransactions");
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("butler mount");

    ZilswapConnector.registerObserver((tx: ObservedTx, status: TxStatus, receipt?: TxReceipt) => {
      console.log("butler observed tx", tx.hash, status);

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

    mounted = true;
    return () => {
      mounted = false
      ZilswapConnector.registerObserver(null);
    };

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
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

    // eslint-disable-next-line
  }, [walletState.wallet]);

  useEffect(() => {
    console.log("butler init");

    const tokenState: TokenState = store.getState().token;
    if (tokenState.initialized) {
      dispatch(actions.Token.invalidate());
      return;
    };

    runInitZilswap(async () => {
      await ZilswapConnector.initialise({
        network: Network.TestNet,
      });
      const zilswapTokens = ZilswapConnector.getTokens(); // test new pool: .filter(token => token.symbol !== "ITN");

      const tokens: { [index: string]: TokenInfo } = {};
      zilswapTokens.map(mapZilswapToken).forEach(token => tokens[token.address] = token);

      // inject ZIL as a pseudo-token
      tokens["zil"] = {
        isZil: true,
        dirty: false,
        initialized: true,
        listPriority: 0,
        address: ZIL_HASH,
        decimals: 12,
        balance: walletState.wallet?.balance,
        init_supply: new BN(0),
        name: "Zilliqa",
        symbol: "ZIL",
        balances: {},
      };

      // initialize store TokenState
      dispatch(actions.Token.init({ tokens }));
    });

    // eslint-disable-next-line
  }, [tokenState.initialized, walletState.wallet]);

  useEffect(() => {

    const tokens = store.getState().token.tokens;
    for (const address in tokens) {
      const token = tokens[address];

      // skip initialized tokens to prevent run away
      // update cycle by useEffect.
      if (token.initialized && !token.dirty) continue;
      console.log(`butler update:${token.symbol}`);

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
        if (token.isZil) {
          const walletAddress = walletState.wallet?.addressInfo.byte20;
          let balance: BN | undefined;
          if (walletAddress) {
            const balanceRPCResponse = await ZilswapConnector.getZilliqa().blockchain.getBalance(walletAddress);
            const balanceResult = parseBalanceResponse(balanceRPCResponse as RPCResponse<any, string>);
            balance = balanceResult.balance;
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

        // prepare and dispatch token info update to store.
        const tokenInfo: TokenInfo = {
          initialized: true,
          dirty: false,
          loading: false,
          isZil: false,

          address: token.address,
          decimals: token.decimals,
          balance: token.balance,

          init_supply: new BN(contractInit.init_supply),
          symbol: contractInit.symbol,
          name: contractInit.name,

          pool, balances,

        };
        dispatch(actions.Token.update(tokenInfo));
      });
    }

    // eslint-disable-next-line
  }, [tokenState.tokens]);

  return null;
};