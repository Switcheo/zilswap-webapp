import { Value } from "@zilliqa-js/contract";
import { BN } from "@zilliqa-js/util";
import { actions } from "app/store";
import { RootState, TokenInfo, TokenState, WalletState, TokenBalanceMap } from "app/store/types";
import { ZilswapConnector, TokenDetails } from "core/zilswap";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAsyncTask } from "app/utils";

export type AppButlerProps = {

};

const mapZilswapToken = (zilswapToken: TokenDetails): TokenInfo => {
  return {
    address: zilswapToken.address,
    decimals: zilswapToken.decimals,
    symbol: zilswapToken.symbol,
    name: "",
    init_supply: new BN(0),
    balances: {},
  }
};
const zilParamsToMap = (params: Value[]): { [index: string]: any } => {
  const output: { [index: string]: any } = {};
  for (const set of params)
    output[set.vname] = set.value;
  return output;
};

// eslint-disable-next-line
let mounted = false;
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
    const zilswapTokens = ZilswapConnector.getTokens();

    const tokens: { [index: string]: TokenInfo } = {};
    zilswapTokens.map(mapZilswapToken).forEach(token => tokens[token.address] = token);

    dispatch(actions.Token.init({ tokens }));

    for (const zilswapToken of zilswapTokens) {
      runQueryToken(async () => {
        const contractInitParams = await zilswapToken.contract.getInit();
        const { balances_map: contractBalanceState } = await zilswapToken.contract.getSubState("balances_map");
        const contractInit = zilParamsToMap(contractInitParams);

        const balances: TokenBalanceMap = {};
        for (const address in contractBalanceState)
          balances[address] = new BN(contractBalanceState[address]);

        const tokenInfo: TokenInfo = {
          balances,
          address: zilswapToken.address,
          decimals: zilswapToken.decimals,
          init_supply: new BN(contractInit.init_supply),
          symbol: contractInit.symbol,
          name: contractInit.name,
        };

        dispatch(actions.Token.update(tokenInfo));
      });
    }

    // eslint-disable-next-line
  }, [walletState.wallet, tokenState.initialized]);

  return null;
};