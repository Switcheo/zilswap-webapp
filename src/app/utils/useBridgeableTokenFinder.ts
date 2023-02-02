import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Blockchain } from "carbon-js-sdk";
import { BridgeableTokenMapping, RootState } from "app/store/types";
import { useTokenFinder } from "app/utils";

const useBridgeableTokenFinder = () => {
  const bridgeableTokens = useSelector<RootState, BridgeableTokenMapping>(store => store.bridge.tokens);
  const tokenFinder = useTokenFinder();

  const bridgeableTokenFinder = useMemo(() => {
    return (denom: string, blockchain: Blockchain.Zilliqa | Blockchain.Ethereum | Blockchain.Arbitrum): any => {
      const bridgeableToken = bridgeableTokens.filter(token => token.denom === denom && token.blockchain === blockchain)[0];
      console.log("bridgeable token", bridgeableToken)
      return bridgeableToken
        ? tokenFinder(bridgeableToken?.tokenAddress, blockchain)
        : {}
    }
    
    // eslint-disable-next-line
  }, [bridgeableTokens]);

  return bridgeableTokenFinder;
};

export default useBridgeableTokenFinder;
