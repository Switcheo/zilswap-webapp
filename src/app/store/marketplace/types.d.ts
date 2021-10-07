import { SimpleMap } from "app/utils";
import BigNumber from "bignumber.js";

export interface MarketPlaceState {
  collections: SimpleMap<Collection>;
  tokens: SimpleMap<Nft>;
  filter: CollectionFilter;
  profile?: Profile;
}

export interface Nft {
  name?: string;
  token_id: number;
  description?: string;
  metadata?: string;
  asset?: Asset;
  owner?: MarketplaceUser;
  collection?: Collection;
  trait_values?: TraitValue[];
}

export type TraitType = {
  trait: string;
  collection?: Collection;
  values: {[id: string]: TraitValue};
}

export interface TraitValue {
  value: string;
  count: number;
  trait_type?: TraitType;
  selected: boolean;
}

export interface Collection {
  name: string;
  description: string;
  address: string;
  verified_at: string;
  website_url: string;
  discord_url: string;
  telegram_url: string;
  twitter_url: string;
  instagram_url: string;
}

export interface Asset {
  type: string;
  mime_type: string;
  filename: string;
  url: string;
  content_length?: number;
}

export type MarketplaceUser = {
  username?: string;
  address: string;
}

export interface NftAttribute {
  trait_type: string;
  value: string;
  rarity: number;
}

export interface Profile {
  ownedNft: SimpleMap<Nft>;
  biddedNft?: SimpleMap<BiddedNft>;
}

export interface BiddedNft {
  nft: Nft;
}

export interface CollectionFilter {
  sale_type: SaleType;
  traits: {[id: string]: TraitType};
}

export interface SaleType {
  fixed_price: boolean;
  timed_auction: boolean;
}