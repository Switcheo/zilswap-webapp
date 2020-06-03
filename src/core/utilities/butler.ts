import { Value } from "@zilliqa-js/contract";
import { BN } from "@zilliqa-js/util";
import { actions } from "app/store";
import { RootState, TokenBalanceMap, TokenInfo, TokenState, WalletState } from "app/store/types";
import { useAsyncTask } from "app/utils";
import { ConnectedWallet } from "core/wallet";
import { ZilswapConnector } from "core/zilswap";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { TokenDetails } from "zilswap-sdk";
import { ZIL_HASH } from "zilswap-sdk/lib/constants";

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
  const [runQueryToken] = useAsyncTask<void>("queryTokenInfo");
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("butler mount");
    mounted = true;
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    console.log("butler init");
    if (tokenState.initialized) return;
    if (!walletState.wallet) return;
    const zilswapTokens = ZilswapConnector.getTokens(); // test new pool: .filter(token => token.symbol !== "ITN");

    const tokens: { [index: string]: TokenInfo } = {};
    zilswapTokens.map(mapZilswapToken).forEach(token => tokens[token.address] = token);

    const wallet: ConnectedWallet = walletState.wallet!;
    // inject ZIL as a pseudo-token
    tokens["zil"] = {
      isZil: true,
      initialized: true,
      listPriority: 0,
      address: ZIL_HASH,
      decimals: 12,
      balance: wallet.balance,
      init_supply: new BN(0),
      name: "Zilliqa",
      symbol: "ZIL",
      balances: {

        // initialize with own wallet balance
        [wallet.addressInfo.byte20.toLowerCase()]: wallet.balance,
      },
    };

    // initialize store TokenState
    dispatch(actions.Token.init({ tokens }));

    // eslint-disable-next-line
  }, [walletState.wallet, tokenState.initialized]);

  useEffect(() => {

    for (const address in tokenState.tokens) {
      const token = tokenState.tokens[address];

      // skip initialized tokens to prevent run away
      // update cycle by useEffect.
      if (token.initialized) continue;
      console.log(`butler update:${token.symbol}`);

      // set initialized to true to prevent repeat execution
      // due to useEffect triggering.
      // set loading to true for UI implementations.
      dispatch(actions.Token.update({
        address,
        loading: true,
        initialized: true,
      }));

      runQueryToken(async () => {
        // retrieve contract and init params
        const contract = ZilswapConnector.getZilliqa().contracts.at(address);
        const contractInitParams = await contract.getInit();
        const contractInit = zilParamsToMap(contractInitParams);

        // retrieve balances of each token owner
        const { balances_map: contractBalanceState } = await contract.getSubState("balances_map");

        // map balance object from string values to BN values
        const balances: TokenBalanceMap = {};
        for (const address in contractBalanceState)
          balances[address] = new BN(contractBalanceState[address]);

        // retrieve token pool, if it exists
        const pool = ZilswapConnector.getPool(token.address) || undefined;

        // retrieve user's token balance, if it exists
        const wallet: ConnectedWallet = walletState.wallet!;
        const balance = balances[wallet.addressInfo.byte20.toLowerCase()] || new BN(0)

        // prepare and dispatch token info update to store.
        const tokenInfo: TokenInfo = {
          initialized: true,
          loading: false,
          isZil: false,

          address: token.address,
          decimals: token.decimals,

          init_supply: new BN(contractInit.init_supply),
          symbol: contractInit.symbol,
          name: contractInit.name,

          pool, balances, balance,

        };
        dispatch(actions.Token.update(tokenInfo));
      });
    }

    // eslint-disable-next-line
  }, [tokenState.tokens]);

  return null;
};