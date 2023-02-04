import { useMemo } from "react";
import { fromBech32Address, toBech32Address } from "@zilliqa-js/crypto";
import { Blockchain } from "carbon-js-sdk";
import { useSelector } from "react-redux";
import { RootState, TokenInfo } from "app/store/types";
import { SimpleMap } from "./types";
import { BRIDGEABLE_EVM_CHAINS } from './constants'

const useTokenFinder = () => {
  const tokens = useSelector<RootState, SimpleMap<TokenInfo>>(store => store.token.tokens);

  const tokenFinder = useMemo(() => {
    return (address: string, blockchain: Blockchain = Blockchain.Zilliqa): TokenInfo | undefined => {

      address = address.toLowerCase();
      if (blockchain === Blockchain.Zilliqa && !address.startsWith("zil")) {
        address = toBech32Address(address);
      } else if (BRIDGEABLE_EVM_CHAINS.includes(blockchain) && address.startsWith("zil")) {
        address = fromBech32Address(address);
      }

      if (BRIDGEABLE_EVM_CHAINS.includes(blockchain) && !address.startsWith("0x")) {
        address = `0x${address}`;
      }

      return tokens[address];
    }
  }, [tokens]);

  return tokenFinder;
};

export default useTokenFinder;
