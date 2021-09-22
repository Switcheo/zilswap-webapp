import { ConnectedWallet } from "core/wallet";
import { ZilswapConnector } from "./connector";
import { NftContractBech32 } from "app/utils/constants";
import { NftMetadata } from "app/store/types";

export const getOwnedToken = async (wallet: ConnectedWallet | null): Promise<string | unknown[]> => {
  const zilswap = ZilswapConnector.getSDK()
  if (!zilswap) throw new Error('not initialized');
  if (!wallet) throw new Error('invalid wallet');

  const nftContract = zilswap.zilliqa.contracts.atBech32(NftContractBech32[zilswap.network].Nft);
  const result = await nftContract.getSubState("token_owners");

  const ownedTokenIds = Object.entries(result.token_owners).filter(
    ([tokenId, owner]) => owner === wallet.addressInfo.byte20.toLowerCase()
  );

  return ownedTokenIds.map((entry) => entry[0])
}

export const getNftImage = async (tokenIds: string[]) => {
  const zilswap = ZilswapConnector.getSDK()
  if (!zilswap) throw new Error('not initialized');

  const nftContract = zilswap.zilliqa.contracts.atBech32(NftContractBech32[zilswap.network].Nft);
  const result = await nftContract.getSubState("token_uris");
  const tokenList: NftMetadata[] = [];

  for (const tokenId of tokenIds) {
    const response = await fetch(result.token_uris[tokenId]);
    const metadata = await response.json();
    tokenList.push(metadata as NftMetadata);
  }

  return tokenList;
}