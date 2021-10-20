import { SimpleMap } from "app/utils";
import { SortBy } from "./actions";

export interface MarketPlaceState {
  collections: SimpleMap<Collection>;
  tokens: [];
  filter: CollectionFilter;
  filters: {
    collectionFilter: CollectionFilter;
    profileFilter: CollectionFilter;
  }
  profile?: Profile;
  oAuth?: OAuth;
  receivedBids?: any;
  bidded?: any;
  profileTokens: Nft[];
}

export interface SimpleCheque {
  id: string;
  createdAt: string;
  updatedAt: string;
  initiatorAddress: string;
  brokerAddress: string;
  side: 'buy' | 'sell';
  feeAmount: string;
  publicKey: string;
  signature: string;
  nonce: string;
  expiry: number;
  price: {
    amount: string;
    address: string;
  },
  cancelTransactionHash: string | null;
  matchTransactionHash: string | null;
};

export interface Cheque extends SimpleCheque {
  token: Pick<Nft, 'tokenId', 'collection', 'asset'>;
  collection: {
    name: string;
    address: string;
  }
  owner: Profile | null;
  initiator: Profile | null;
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

  bestAsk: null | SimpleCheque;
  bestBid: null | SimpleCheque;
  isFavourited?: boolean;
  statistics?: SimpleMap<string>
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
  id?: string;
  host?: string
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
  profileImage?: {
    url: string;
  }
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
  offset?: number;
  count?: number;
  limit?: number;
}

export interface CollectionFilter {
  sale_type: SaleType;
  collectionAddress?: string;
  traits: { [id: string]: TraitType };
  pagination?: PaginationInfo;
  sortBy: SortBy;
  filterPage: "collection" | "profile";
  owner?: string;
}

export interface SaleType {
  fixed_price: boolean;
  timed_auction: boolean;
}
