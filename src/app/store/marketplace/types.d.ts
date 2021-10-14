import { SortBy } from "app/components/ARKFilterBar/components/SortFilter";
import { SimpleMap } from "app/utils";

export interface MarketPlaceState {
  collections: SimpleMap<Collection>;
  tokens: [];
  filter: CollectionFilter;
  profile?: Profile;
  oAuth?: OAuth;
  receivedBids?: any;
  bidded?: any;
}

export interface Cheque {
  id: string;
  createdAt: string;
  updatedAt: string;
  initiatorAddress: string;
  brokerAddress: string;
  side: 'buy' | 'sell';
  feeAmount: string;
  publicKey: string;
  nonce: number;
  expiry: number;
  token: Pick<Nft, 'tokenId', 'collection', 'asset'>;
  asset: Asset;
  price: {
    amount: string;
    address: string;
  },
  collection: {
    name: string;
    address: string;
  }
  owner: Profile | null;
  initiator: Profile | null;
  cancelTransactionHash: string | null;
  matchTransactionHash: string | null;
}

export interface Nft {
  name?: string;
  tokenId: number;
  description?: string;
  metadata?: string;
  asset?: Asset;
  user?: MarketplaceUser;
  collection?: Collection;
  traitValues?: TraitValue[];
}

export type TraitType = {
  trait: string;
  collection?: Collection;
  values: { [id: string]: TraitValue };
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
  email?: string;
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

export interface PaginatedList<T> {
  entries: T[];
  meta: PaginationInfo;
}

export interface PaginationInfo {
  offset: number;
  count: number;
  limit: number;
}

export interface CollectionFilter {
  sale_type: SaleType;
  collectionAddress?: string;
  traits: { [id: string]: TraitType };
  pagination?: PaginationInfo;
  sortBy: SortBy;
}

export interface SaleType {
  fixed_price: boolean;
  timed_auction: boolean;
}
