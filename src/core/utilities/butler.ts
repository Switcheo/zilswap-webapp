import { Value } from "@zilliqa-js/contract";
import { BN } from "@zilliqa-js/util";
import { actions } from "app/store";
import { RootState, TokenBalanceMap, TokenInfo, TokenState, WalletState } from "app/store/types";
import { useAsyncTask } from "app/utils";
import { ConnectedWallet } from "core/wallet";
import { TokenDetails, ZilswapConnector } from "core/zilswap";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export type AppButlerProps = {

};

const mapZilswapToken = (zilswapToken: TokenDetails): TokenInfo => {
  return {
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
export const zilParamsToMap = (params: Value[]): { [index: string]: any } => {
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
    const zilswapTokens = ZilswapConnector.getTokens(); // test new pool: .filter(token => token.symbol !== "ITN");

    const tokens: { [index: string]: TokenInfo } = {};
    zilswapTokens.map(mapZilswapToken).forEach(token => tokens[token.address] = token);

    const wallet: ConnectedWallet = walletState.wallet!;
    // inject ZIL as a token
    tokens["zil"] = {
      isZil: true,
      listPriority: 0,
      address: "",
      decimals: 12,
      balance: wallet.balance,
      init_supply: new BN(0),
      name: "Zilliqa",
      symbol: "ZIL",
      balances: {
        [wallet.addressInfo.byte20.toLowerCase()]: wallet.balance,
      },
    };

    dispatch(actions.Token.init({ tokens }));

    for (const zilswapToken of zilswapTokens) {
      runQueryToken(async () => {
        const contractInitParams = await zilswapToken.contract.getInit();
        const wallet: ConnectedWallet = walletState.wallet!;
        const { balances_map: contractBalanceState } = await zilswapToken.contract.getSubState("balances_map");
        const contractInit = zilParamsToMap(contractInitParams);

        const balances: TokenBalanceMap = {};
        for (const address in contractBalanceState)
          balances[address] = new BN(contractBalanceState[address]);

        const pool = ZilswapConnector.getPool(zilswapToken.address) || undefined;

        const tokenInfo: TokenInfo = {
          pool, balances,
          isZil: false,
          address: zilswapToken.address,
          decimals: zilswapToken.decimals,
          init_supply: new BN(contractInit.init_supply),
          symbol: contractInit.symbol,
          name: contractInit.name,
          balance: balances[wallet.addressInfo.byte20.toLowerCase()] || new BN(0),
        };
        dispatch(actions.Token.update(tokenInfo));
      });
    }

    // eslint-disable-next-line
  }, [walletState.wallet, tokenState.initialized]);

  return null;
};