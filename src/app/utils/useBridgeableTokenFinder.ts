import { BridgeableTokenMapping, RootState } from "app/store/types";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Blockchain } from "tradehub-api-js";

const useBridgeableTokenFinder = () => {
  const bridgeableTokens = useSelector<RootState, BridgeableTokenMapping>(store => store.bridge.tokens);

  const bridgeableTokenFinder = useMemo(() => {
    return (denom: string, blockchain: Blockchain.Zilliqa | Blockchain.Ethereum): any => {
      return bridgeableTokens[blockchain].filter(token => token.denom === denom)[0];
    }
  }, [bridgeableTokens]);

  return bridgeableTokenFinder;
};

export default useBridgeableTokenFinder;
