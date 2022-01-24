import { SimpleMap } from "app/utils";
import { ArkClient, ArkExchangeInfo } from "core/utilities";
import { SortBy } from "./actions";

export interface MarketPlaceState {
  collections: SimpleMap<CollectionWithStats>;
  tokens: ReadonlyArray<Nft>;
  filter: CollectionFilter;
  profile?: Profile;
  oAuth?: OAuth;
  receivedBids?: any;
  bidded?: any;
  exchangeInfo?: ArkExchangeInfo;
  collectionTraits: SimpleMap<SimpleMap<TraitType>>;
  filteredTokensTraits: SimpleMap<TraitType>;
  pendingTxs: SimpleMap<ArkPendingTx>;
  bidsTable?: BidsTableInfo;
}

export interface BidsTableInfo extends ArkClient.ListChequesParams {
  bids: Cheque[],
};

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
  chequeHash: string;
  cancelTransactionHash: string | null;
  matchTransactionHash: string | null;
  invalidatedAt: string | null;
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
  collection: Collection;
  traitValues: TraitValueWithType[];

  bestAsk: null | SimpleCheque;
  bestBid: null | SimpleCheque;
  isFavourited?: boolean;
  statistics?: SimpleMap<string>
  lastTrade?: null | SimpleCheque;
}

export type TraitValueWithType = {
  value: string;
  count: number;
  traitType: {
    trait: string;
  }
}

export type TraitType = {
  trait: string;
  values: SimpleMap<TraitValue>;
}

export interface TraitValue {
  value: string;
  count: number;
}

export type TraitTypeWithSelection = {
  trait: string;
  values: SimpleMap<TraitValueWithSelection>;
}

export interface TraitValueWithSelection extends TraitValue {
  selected: boolean
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
  bannerImageUrl: string | null;
  profileImageUrl: string | null;

  ownerName: string | null;
  royaltyBps: number | null;
  royaltyType: string | null;
  artists?: SimpleMap<string>;
}

export interface CollectionWithStats extends Collection {
  priceStat: CollectionPriceStat | null;
  tokenStat: CollectionTokenStat;
}

export interface CollectionPriceStat {
  volume: string;
  allTimeVolume: string;
  floorPrice: string;
}

export interface CollectionTokenStat {
  holderCount: string;
  tokenCount: string;
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

export interface Profile extends MarketplaceUser {
  id: string;
  bio: string | null;
  twitterHandle: string | null;
  instagramHandle: string | null;
  websiteUrl: string | null;
  email: string | null;
  profileImage?: {
    url: string;
  };
  bannerImage?: {
    url: string;
  };
  admin?: boolean;
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
  address: string
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
  traits: { [id: string]: TraitTypeWithSelection };
  sortBy: SortBy;
  saleType: SaleType;
  search: string;
  artist: string | null;
  collectionAddress: string | null;
  owner: string | null;
  likedBy: string | null;
  pagination?: PaginationInfo;
  infinite?: boolean;
}

export interface SaleType {
  fixed_price: boolean;
  timed_auction: boolean;
}

export interface ArkPendingTx {
  txHash: string;
  chequeHash: string;
}

export interface QueryNftResult extends PaginatedList<Nft> {
  traits?: SimpleMap<TraitType>;
}
