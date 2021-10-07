import { SimpleMap } from "app/utils";

export interface MarketPlaceState {
  collections: SimpleMap<Collection>;
  tokens: SimpleMap<Nft>;
  filter: CollectionFilter;
  profile?: Profile;
  oAuth?: OAuth;
  receivedBids?: any;
  bidded?: any;
}

export interface Nft {
  name?: string;
  tokenId: number;
  description?: string;
  metadata?: string;
  asset?: Asset;
  owner?: MarketplaceUser;
  collection?: Collection;
  traitValues?: TraitValue[];
}

export type TraitType = {
  trait: string;
  collection?: Collection;
  values: {[id: string]: TraitValue};
}

export interface TraitValue {
  value: string;
  count: number;
  traitType?: TraitType;
  selected: boolean;
}

export interface Collection {
  name: string;
  description: string;
  address: string;
  verifiedAt: string;
  websiteUrl: string;
  discordUrl: string;
  telegramUrl: string;
  twitterUrl: string;
  instagramUrl: string;
}

export interface Asset {
  type: string;
  mimeType: string;
  filename: string;
  url: string;
  contentLength?: number;
}

export type MarketplaceUser = {
  username?: string;
  address: string;
}

export interface NftAttribute {
  traitType: string;
  value: string;
  rarity: number;
}

export interface Profile {
  id: string;
  username?: string;
  address: string;
  bio?: string;
  twitterHandle?: string;
  instagramHandle?: string;
  websiteUrl?: string;
}

export interface BiddedNft {
  nft: Nft;
}

export interface OAuth {
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

export interface CollectionFilter {
  sale_type: SaleType;
  traits: {[id: string]: TraitType};
}

export interface SaleType {
  fixed_price: boolean;
  timed_auction: boolean;
}
