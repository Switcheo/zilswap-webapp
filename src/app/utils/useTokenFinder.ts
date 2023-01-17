import { useMemo } from "react";
import { fromBech32Address, toBech32Address } from "@zilliqa-js/crypto";
import { Blockchain } from "carbon-js-sdk";
import { useSelector } from "react-redux";
import { RootState, TokenInfo } from "app/store/types";
import { SimpleMap } from "./types";

const useTokenFinder = () => {
  const tokens = useSelector<RootState, SimpleMap<TokenInfo>>(store => store.token.tokens);

  const tokenFinder = useMemo(() => {
    return (address: string, blockchain: Blockchain = Blockchain.Zilliqa): TokenInfo | undefined => {

      address = address.toLowerCase();
      if (blockchain === Blockchain.Zilliqa && !address.startsWith("zil")) {
        address = toBech32Address(address);
      } else if ((blockchain === Blockchain.Ethereum || blockchain === Blockchain.Arbitrum) && address.startsWith("zil")) {
        address = fromBech32Address(address);
      }

      if ((blockchain === Blockchain.Ethereum || blockchain === Blockchain.Arbitrum) && !address.startsWith("0x")) {
        address = `0x${address}`;
      }

      return tokens[address];
    }
  }, [tokens]);

  return tokenFinder;
};

export default useTokenFinder;
