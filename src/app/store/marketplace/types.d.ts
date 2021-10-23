import { SimpleMap } from "app/utils";
import { ArkExchangeInfo } from "core/utilities";
import { SortBy } from "./actions";

export interface MarketPlaceState {
  collections: SimpleMap<Collection>;
  tokens: ReadonlyArray<Nft>;
  filter: CollectionFilter;
  profile?: Profile;
  oAuth?: OAuth;
  receivedBids?: any;
  bidded?: any;
  exchangeInfo?: ArkExchangeInfo;
  collectionTraits: SimpleMap<CollectionTrait[]>;
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
  lastTrade?: null | SimpleCheque;
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

export interface CollectionPriceStat {
  volume: string;
  floorPrice: string;
}

export interface CollectionTokenStat {
  holderCount: string;
  tokenCount: string;
}

export interface Collection {
  name: string;
  description: string | null;
  address: string;
  verifiedAt: string | null;
  websiteUrl: string | null;
  discordUrl: string | null;
  telegramUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  royaltyBps: string | null;
  royaltyType: string | null;

  ownerName: string | null;
  royaltyBps: number | null;
  royaltyType: string | null;


  priceStat?: CollectionPriceStat;
  tokenStat?: CollectionTokenStat;
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
  username: string | null;
  address: string;
}

export interface NftAttribute {
  traitType: string;
  value: string;
  rarity: number;
}

export interface Profile extends MarketplaceUser {
  id: string;
  bio: string | null;
  twitterHandle: string | null;
  instagramHandle: string | null;
  websiteUrl: string | null;
  email: string | null;
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
  traits: { [id: string]: TraitType };
  sortBy: SortBy;
  saleType: SaleType;
  search: string;
  collectionAddress: string | null;
  owner: string | null;
  likedBy: string | null;
  pagination?: PaginationInfo;
}

export interface SaleType {
  fixed_price: boolean;
  timed_auction: boolean;
}

export interface CollectionTrait {
  trait: string;
  values: SimpleMap<number>;
}
