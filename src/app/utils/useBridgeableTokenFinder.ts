import { useMemo } from "react";
import { useSelector } from "react-redux";
import { BridgeableChains, BridgeableTokenMapping, RootState } from "app/store/types";
import { useTokenFinder } from "app/utils";

const useBridgeableTokenFinder = () => {
  const bridgeableTokens = useSelector<RootState, BridgeableTokenMapping>(store => store.bridge.tokens);
  const tokenFinder = useTokenFinder();

  const bridgeableTokenFinder = useMemo(() => {
    return (denom: string, blockchain: BridgeableChains): any => {
      const bridgeableToken = bridgeableTokens.filter(token => token.denom === denom && token.blockchain === blockchain)[0];
      return bridgeableToken
        ? tokenFinder(bridgeableToken?.tokenAddress, blockchain)
        : {}
    }
    
    // eslint-disable-next-line
  }, [bridgeableTokens]);

  return bridgeableTokenFinder;
};

export default useBridgeableTokenFinder;
