import { BridgeableTokenMapping, RootState } from "app/store/types";
import { useTokenFinder } from "app/utils";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Blockchain } from "tradehub-api-js";

const useBridgeableTokenFinder = () => {
  const bridgeableTokens = useSelector<RootState, BridgeableTokenMapping>(store => store.bridge.tokens);
  const tokenFinder = useTokenFinder();

  const bridgeableTokenFinder = useMemo(() => {
    return (denom: string, blockchain: Blockchain.Zilliqa | Blockchain.Ethereum): any => {
      const bridgeableToken = bridgeableTokens[blockchain].filter(token => token.denom === denom)[0];
      return bridgeableToken
        ? tokenFinder(bridgeableToken?.tokenAddress, blockchain)
        : {}
    }
    
    // eslint-disable-next-line
  }, [bridgeableTokens]);

  return bridgeableTokenFinder;
};

export default useBridgeableTokenFinder;
