import BigNumber from "bignumber.js";

export interface MarketPlaceState {
  collections: {},
  tokens: { [index: string]: NftMetadata },
  filter: {},
  profile: ProfileInfo,
}

export interface NftMetadata {
  id: string,
  name?: string,
  description?: string;
  image?: string,
  attributes?: NftAttribute,
}


export interface NftAttribute {
  trait_type: string;
  value: string;
  rarity: number;
}

export interface ProfileInfo {
  ownedNft: { [index: string]: NftMetadata },
  biddedNft?: { [index: string]: BiddedNftInfo }
}

export interface BiddedNftInfo {
  nft: NftMetadata,
}