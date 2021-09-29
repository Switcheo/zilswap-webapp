import BigNumber from "bignumber.js";

export interface MarketPlaceState {
  collections: { [index: string]: Collection },
  tokens: { [index: string]: Nft },
  filter: {},
  profile: ProfileInfo,
}

export interface Nft {
  id: string,
  name?: string,
  token_id: number,
  collection_id: string,
  owner_id: string,
  description?: string,
  metadata?: string,
  asset_id?: string,
  asset?: Asset,
  collection?: Collection,
  trait_values?: Trait[]
}

export type TraitType = {
  id: string,
  trait: string,
  collection_id: string,
}
export interface Trait {
  id: string,
  value: string,
  count: number,
  trait_type_id: string,
  trait_type: TraitType,
}
export interface Collection {
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
export interface asset {
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
  ownedNft: { [index: string]: Nft },
  biddedNft?: { [index: string]: BiddedNftInfo }
}

export interface BiddedNftInfo {
  nft: Nft,
}