import BigNumber from "bignumber.js";

export interface MarketPlaceState {
  collections: { [index: string]: CollectionData },
  tokens: { [index: string]: NftData },
  filter: {},
  profile: ProfileInfo,
}

export interface NftData {
  id: string,
  name?: string,
  token_id: number,
  collection_id: string,
  owner_id: string,
  description?: string,
  metadata?: string,
  asset_id?: string,
  asset?: AssetData,
  collection?: CollectionData,
  trait_values?: TraitData[]
}

export type TraitType = {
  id: string,
  trait: string,
  collection_id: string,
}
export interface TraitData {
  id: string,
  value: string,
  count: number,
  trait_type_id: string,
  trait_type: TraitType,
}
export interface CollectionData {
  id: string,
  name: string,
  description: string,
  address: string,
  verified_at: string,
  website_url: string,
  discord_url: string,
  telegram_url: string,
  twitter_url: string,
  instagram_url: string,
}
export interface assetData {
  id: string,
  type: string,
  mime_type: string,
  filename: string,
  url: string,
  host: string,
  content_length?: number,
}


export interface NftAttribute {
  trait_type: string;
  value: string;
  rarity: number;
}

export interface ProfileInfo {
  ownedNft: { [index: string]: NftData },
  biddedNft?: { [index: string]: BiddedNftInfo }
}

export interface BiddedNftInfo {
  nft: NftData,
}