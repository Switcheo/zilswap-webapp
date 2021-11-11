import crypto from "crypto";
import { CallParams } from '@zilliqa-js/contract'
import { BN, bytes, Long } from '@zilliqa-js/util';
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { Zilswap } from "zilswap-sdk";
import { Network, ZIL_HASH } from "zilswap-sdk/lib/constants";
import { Cheque, Collection, CollectionWithStats, Nft, OAuth, Profile, SimpleCheque, TraitType, PaginationInfo } from "app/store/types";
import { bnOrZero, SimpleMap, toHumanNumber } from "app/utils";
import { HTTP, logger } from "core/utilities";
import { ConnectedWallet } from "core/wallet";
import { fromBech32Address } from "core/zilswap";
import { WZIL_TOKEN_CONTRACT, ZIL_DECIMALS } from "app/utils/constants";
import { CHAIN_IDS, MSG_VERSION } from "../zilswap/constants";

const ARK_ENDPOINTS: SimpleMap<string> = {
  [Network.MainNet]: "https://api-ark.zilswap.org",
  [Network.TestNet]: "https://test-api-ark.zilswap.org",
} as const;

const LOCALHOST_ENDPOINT = "http://localhost:8181";


export const ARK_CONTRACTS: { [key in Network]: { broker: string, tokenProxy: string } } = {
  [Network.MainNet]: { broker: 'zil1jna6pq6fsjsxdkvkz2wyt6tg80p762neqkz2qh', tokenProxy: 'zil1yrqlm8cxpqt8wq5y6axejvcs2h350ykj9cc758' },
  [Network.TestNet]: { broker: 'zil1nyapz27kck9tteejccfr354tnx89s2sddfzqpl', tokenProxy: 'zil1hfp8fn6026kvel2zc25xztk3lss68nlmqmm2fn' },
}

const apiPaths = {
  "oauth": "/oauth/access_token",
  "exchange/status": "/exchange/status",
  "exchange/info": "/exchange/info",
  "collection/list": "/nft/collection/list",
  "collection/detail": "/nft/collection/:address/detail",
  "collection/search": "/nft/collection/:address/search",
  "collection/traits": "/nft/collection/:address/traits",
  "collection/token/detail": "/nft/collection/:address/:tokenId/detail",
  "collection/resync/metadata": "/nft/collection/:collectionAddress/:tokenId/resync",
  "token/favourite": "/nft/collection/:address/:tokenId/favourite",
  "token/list": "/nft/token/list",
  "trade/list": "/nft/trade/list",
  "trade/post": "/nft/trade/:address/:tokenId",
  "user/list": "/user/list",
  "user/detail": "/user/:address/detail",
  "user/update": "/user/:address/update",
  "user/image/request": "/user/:address/upload/request",
  "user/image/notify": "/user/:address/upload/notify",
  "user/image/remove": "/user/:address/upload/remove",
};

const getHttpClient = (network: Network) => {
  const endpoint = process.env.REACT_APP_ARK_API_LOCALHOST === "true" ? LOCALHOST_ENDPOINT : ARK_ENDPOINTS[network];
  return new HTTP(endpoint, apiPaths);
}

export interface ArkExchangeInfo {
  network: Network;
  brokerAddress: string;
  tokenProxyAddress: string;
  featuredCollections: string[];
  baseFeeBps: number;
  denoms: string[];
}

export interface ListQueryParams {
  limit?: number;
  offset?: number;
}

export type TraitsResponse = {
  trait: string;
  values: SimpleMap<number>;
}[]

export class ArkClient {
  public readonly brokerAddress: string;
  public readonly tokenProxyAddress: string;
  private http: HTTP<typeof apiPaths>;

  constructor(
    public readonly network: Network,
  ) {
    this.http = getHttpClient(network);
    this.brokerAddress = fromBech32Address(ARK_CONTRACTS[network].broker).toLowerCase();
    this.tokenProxyAddress = fromBech32Address(ARK_CONTRACTS[network].tokenProxy).toLowerCase();
  }

  checkError = async (result: any) => {
    if (result.error) {
      const message = [];
      if (result.error?.code)
        message.push(`[${result.error.code}]`);
      if (result.error?.type)
        message.push(`${result.error.type}:`);
      message.push(result.error.message ?? "unknown error");

      throw new Error(message.join(" "));
    }
  }

  arkLogin = async (wallet: ConnectedWallet, hostname: string) => {
    const timestamp = dayjs().format("YYYY/MM/DD HH:mm:ss Z");
    const bech32Address = wallet.addressInfo.bech32;
    const signMessage = `[${timestamp}] ARK Authentication\nPlease issue my browser at ${hostname} an ARK API key for my address:\n${bech32Address}`;

    const signResult = await (window as any).zilPay.wallet.sign(signMessage);
    const { message, publicKey, signature } = signResult
    const data = {
      grant_type: "signature",
      public_key: publicKey,
      signature,
      message
    }

    const url = this.http.path("oauth");
    const result = await this.http.post({ url, data });
    const output = await result.json();
    await this.checkError(output);
    output.result.address = bech32Address;
    return output;
  }

  refreshToken = async (refresh_token: string) => {
    const data = {
      grant_type: "refresh_token",
      refresh_token
    }

    const url = this.http.path("oauth");
    const result = await this.http.post({ url, data });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  getExchangeInfo = async () => {
    const url = this.http.path("exchange/info");
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output.result;
  }

  listCollection = async (params?: ArkClient.ListCollectionParams) => {
    const url = this.http.path("collection/list", null, params);
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  getCollectionTraits = async (address: string): Promise<{ traits: SimpleMap<TraitType>, collection: Collection }> => {
    const url = this.http.path("collection/traits", { address }, { limit: 100 });
    const result = await this.http.get({ url });
    const json = await result.json();
    await this.checkError(json);

    const traits = json.result.entries as TraitsResponse
    return { traits: parseTraits(traits), collection: json.result.collection }
  }

  getNftToken = async (address: string, tokenId: string, viewer?: string) => {
    const url = this.http.path("collection/token/detail", { address, tokenId }, { viewer });
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  listNftCheques = async (params: ArkClient.ListChequesParams) => {
    const url = this.http.path("trade/list", {}, params);
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  getProfile = async (address?: string) => {
    const url = this.http.path("user/detail", { address });
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  listTokens = async (params?: ArkClient.ListTokenParams) => {
    const url = this.http.path("token/list", null, params);
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  searchCollection = async (address: string, params?: ArkClient.SearchCollectionParams):
    Promise<{ tokens: ReadonlyArray<Nft>, traits: SimpleMap<TraitType>, meta: PaginationInfo }> => {
    if (address.startsWith("zil1"))
      address = fromBech32Address(address).toLowerCase();
    const url = this.http.path("collection/search", { address }, params);
    const result = await this.http.get({ url });
    const json = await result.json();
    await this.checkError(json);

    const traits = json.result.extras.traits as TraitsResponse
    return { traits: parseTraits(traits), tokens: json.result.entries, meta: json.result.meta }
  }

  updateProfile = async (address: string, data: Omit<Profile, "id" | "address">, oAuth: OAuth) => {
    const headers = { "authorization": "Bearer " + oAuth.access_token };
    const url = this.http.path("user/update", { address })
    const result = await this.http.post({ url, data, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  };

  postTrade = async (params: ArkClient.PostTradeParams) => {
    if (params.address.startsWith("zil1"))
      params.address = fromBech32Address(params.address).toLowerCase();
    if (params.collectionAddress.startsWith("zil1"))
      params.collectionAddress = fromBech32Address(params.collectionAddress).toLowerCase();

    const routeParam = {
      address: params.collectionAddress,
      tokenId: params.tokenId,
    };
    const data = {
      side: params.side.toLowerCase(),
      price: params.price,
      expiry: params.expiry,
      nonce: params.nonce,
      address: params.address,
      publicKey: params.publicKey,
      signature: params.signature,
    };

    const url = this.http.path("trade/post", routeParam)
    const result = await this.http.post({ url, data });
    const output = await result.json();
    await this.checkError(output);
    return output;
  };

  requestImageUploadUrl = async (address: string, access_token: string, type = "profile") => {
    const headers = { Authorization: "Bearer " + access_token };
    const url = this.http.path("user/image/request", { address }, { type });
    const result = await this.http.get({ url, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  putImageUpload = async (url: string, data: Blob) => {
    await this.http.put({ url, data });
    return
  }

  notifyUpload = async (address: string, access_token: string, type = "profile") => {
    const headers = { Authorization: "Bearer " + access_token };
    const url = this.http.path("user/image/notify", { address }, { type });
    const result = await this.http.post({ url, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  removeImage = async (address: string, access_token: string, type: string) => {
    const headers = { Authorization: "Bearer " + access_token };
    const url = this.http.path("user/image/remove", { address }, { type });
    const result = await this.http.del({ url, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  postFavourite = async (address: string, tokenId: number, access_token: string) => {
    const headers = { "authorization": "Bearer " + access_token };
    const url = this.http.path("token/favourite", { address, tokenId });
    const result = await this.http.post({ url, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  removeFavourite = async (address: string, tokenId: number, access_token: string) => {
    const headers = { "authorization": "Bearer " + access_token };
    const url = this.http.path("token/favourite", { address, tokenId });
    const result = await this.http.del({ url, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  resyncMetadata = async (collectionAddress: string, tokenId: number) => {
    const url = this.http.path("collection/resync/metadata", { collectionAddress, tokenId });
    const result = await this.http.post({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  /* ARK utils */

  /**
   * Returns the message to sign for ARK.
   * @param type - the type of message, either 'Execute' or 'Void'
   * @param chequeHash - the computed cheque hash for the trade intent
   * @returns
   */
  arkMessage = (type: 'Execute' | 'Void', chequeHash: string) => {
    return `Zilliqa Signed Message:\n${type} ARK Cheque 0x${chequeHash}`
  }

  /**
   * Computes the cheque hash for a trade intent on ARK.
   * @param params - trade parameters
   * @returns
   */
  arkChequeHash = (params: ArkClient.ArkChequeParams): string => {
    const { side, token, price, feeAmount, expiry, nonce } = params
    if (token.address.startsWith("zil1"))
      token.address = fromBech32Address(token.address);
    const brokerAddress = this.brokerAddress;
    const buffer = [];
    buffer.push(brokerAddress.replace("0x", "").toLowerCase())
    buffer.push(sha256(strToHex(`${brokerAddress}.${side}`)))
    buffer.push(sha256(serializeNFT(brokerAddress, token)))
    buffer.push(sha256(serializePrice(brokerAddress, price)))
    buffer.push(sha256(serializeUint128(side === 'Buy' ? 0 : feeAmount)))
    buffer.push(sha256(strToHex(expiry.toString())))
    buffer.push(sha256(serializeUint128(nonce)))
    logger("ark cheque hashes", buffer);
    return sha256(buffer.join(""))
  }

  getBrokerBrokerAddress() {
    return this.brokerAddress;
  }

  // TODO: Refactor zilswap SDK as instance member;
  async approveAllowanceIfRequired(tokenAddress: string, ownerAddress: string, zilswap: Zilswap) {
    const response = await zilswap.zilliqa.blockchain.getSmartContractSubState(tokenAddress, "operator_approvals");
    const approvalState = response.result.operator_approvals;

    const userApprovals = approvalState?.[ownerAddress.toLowerCase()];
    logger("ark contract approvals", ownerAddress, this.brokerAddress, userApprovals);
    if (userApprovals?.[this.brokerAddress]) return null;

    return await this.approveAllowance(tokenAddress, zilswap);
  }

  // TODO: Refactor zilswap SDK as instance member;
  async approveAllowance(tokenAddress: string, zilswap: Zilswap) {
    const args = [{
      vname: "to",
      type: "ByStr20",
      value: this.brokerAddress,
    }];

    const minGasPrice = (await zilswap.zilliqa.blockchain.getMinimumGasPrice()).result as string;
    const callParams = {
      amount: new BN("0"),
      gasPrice: new BN(minGasPrice),
      gasLimit: Long.fromNumber(20000),
      version: bytes.pack(CHAIN_IDS[this.network], MSG_VERSION),
    };

    const result = await zilswap.callContract(
      zilswap.getContract(tokenAddress),
      "SetApprovalForAll",
      args as any,
      callParams,
      true,
    );

    return result;
  }

  // TODO: Refactor zilswap SDK as instance member;
  async wrapZil(amount: BigNumber, zilswap: Zilswap) {
    const minGasPrice = (await zilswap.zilliqa.blockchain.getMinimumGasPrice()).result as string;
    const callParams = {
      amount: new BN(amount.toString()),
      gasPrice: new BN(minGasPrice),
      gasLimit: Long.fromNumber(20000),
      version: bytes.pack(CHAIN_IDS[this.network], MSG_VERSION),
    };

    const result = await zilswap.callContract(
      zilswap.getContract(WZIL_TOKEN_CONTRACT[zilswap.network]),
      "Mint",
      [],
      callParams,
      true,
    );

    return result;
  }

  async unwrapZil(amount: BigNumber, zilswap: Zilswap) {
    const minGasPrice = (await zilswap.zilliqa.blockchain.getMinimumGasPrice()).result as string;

    const args = [{
      vname: "amount",
      type: "Uint128",
      value: amount.toString(),
    }];
    
    const callParams = {
      amount: new BN(0),
      gasPrice: new BN(minGasPrice),
      gasLimit: Long.fromNumber(20000),
      version: bytes.pack(CHAIN_IDS[this.network], MSG_VERSION),
    };

    const result = await zilswap.callContract(
      zilswap.getContract(WZIL_TOKEN_CONTRACT[zilswap.network]),
      "Burn",
      args as any,
      callParams,
      true,
    );

    return result;
  }

  // TODO: Refactor zilswap SDK as instance member;
  async executeTrade(executeParams: ArkClient.ExecuteTradeParams, zilswap: Zilswap, wallet?: ConnectedWallet) {
    const { nftAddress, tokenId, sellCheque, buyCheque } = executeParams;
    const { address: priceTokenAddress, amount: priceAmount } = sellCheque.price;
    const userAddress = wallet?.addressInfo.byte20.toLowerCase();

    const args = [{
      vname: "token",
      type: `${this.brokerAddress}.NFT`,
      value: this.toAdtNft(nftAddress, tokenId),
    }, {
      vname: "price",
      type: `${this.brokerAddress}.Coins`,
      value: this.toAdtPrice(priceTokenAddress, priceAmount),
    }, {
      vname: "fee_amount",
      type: "Uint128",
      value: sellCheque.feeAmount.toString(),
    }, {
      vname: 'sell_cheque',
      type: `${this.brokerAddress}.Cheque`,
      value: this.toAdtCheque(sellCheque)
    }, {
      vname: 'buy_cheque',
      type: `${this.brokerAddress}.Cheque`,
      value: this.toAdtCheque(buyCheque)
    }];

    const amount = sellCheque.initiatorAddress === userAddress
      ? new BN(0)
      : priceTokenAddress === ZIL_HASH
        ? new BN(priceAmount)
        : new BN(0);

    const minGasPrice = (await zilswap.zilliqa.blockchain.getMinimumGasPrice()).result as string;
    const callParams = {
      amount,
      gasPrice: new BN(minGasPrice),
      gasLimit: Long.fromNumber(20000),
      version: bytes.pack(CHAIN_IDS[this.network], MSG_VERSION),
    };

    const result = await zilswap.callContract(
      zilswap.getContract(this.brokerAddress),
      "ExecuteTrade",
      args as any,
      callParams,
      true,
    );

    return result;
  }

  // TODO: Refactor zilswap SDK as instance member;
  async voidCheque(voidChequeParams: ArkClient.VoidChequeParams, zilswap: Zilswap) {
    const { publicKey, signature, chequeHash } = voidChequeParams;

    const args = [{
      vname: "cheque_hash",
      type: "ByStr32",
      value: `0x${chequeHash.replace(/^0x/i, "")}`,
    }, {
      vname: "pubkey",
      type: "ByStr32",
      value: `0x${publicKey.replace(/^0x/i, "")}`,
    }, {
      vname: "signature",
      type: "ByStr32",
      value: `0x${signature.replace(/^0x/i, "")}`,
    }];

    const minGasPrice = (await zilswap.zilliqa.blockchain.getMinimumGasPrice()).result as string;
    const callParams = {
      amount: new BN(0),
      gasPrice: new BN(minGasPrice),
      gasLimit: Long.fromNumber(20000),
      version: bytes.pack(CHAIN_IDS[this.network], MSG_VERSION),
    };

    const result = await zilswap.callContract(
      zilswap.getContract(this.brokerAddress),
      "VoidCheque",
      args as any,
      callParams,
      true,
    );

    return result;
  }

  /**
   *
   * @param tokenAddress hex address of zrc1 contract starting with 0x
   * @param tokenId token ID
   */
  toAdtNft(nftAddress: string, tokenId: string) {
    if (nftAddress.startsWith("zil"))
      nftAddress = fromBech32Address(nftAddress).toLowerCase();
    return {
      argtypes: [],
      arguments: [nftAddress, tokenId],
      constructor: `${this.brokerAddress}.NFT`,
    }
  }

  /**
   *
   * @param tokenAddress hex address of zrc2 contract starting with 0x
   * @returns
   */
  toAdtToken(tokenAddress: string) {
    if (tokenAddress.startsWith("zil"))
      tokenAddress = fromBech32Address(tokenAddress).toLowerCase();

    if (tokenAddress === ZIL_HASH)
      return {
        argtypes: [],
        arguments: [],
        constructor: `${this.brokerAddress}.Zil`,
      };

    return {
      argtypes: [],
      arguments: [tokenAddress],
      constructor: `${this.brokerAddress}.Token`,
    };
  }

  /**
   *
   * @param tokenAddress hex address of zrc2 contract starting with 0x
   * @param amountUnitless amount in unitless form
   */
  toAdtPrice(tokenAddress: string, amountUnitless: string) {
    return {
      argtypes: [],
      arguments: [
        this.toAdtToken(tokenAddress),
        amountUnitless.toString(),
      ],
      constructor: `${this.brokerAddress}.Coins`,
    }
  }

  toAdtChequeSide(side: string) {
    const _side = parseChequeSide(side);
    return {
      argtypes: [],
      arguments: [],
      constructor: `${this.brokerAddress}.${_side}`,
    };
  }

  toAdtCheque(cheque: ArkClient.ExecuteBuyCheque) {
    return {
      argtypes: [],
      arguments: [
        this.toAdtChequeSide(cheque.side),
        cheque.expiry.toString(10),
        cheque.nonce.toString(),
        cheque.publicKey,
        cheque.signature,
      ],
      constructor: `${this.brokerAddress}.Cheque`,
    }
  }

  static parseCollectionStats(collection: CollectionWithStats) {
    const floorPrice = bnOrZero(collection.priceStat?.floorPrice).shiftedBy(-ZIL_DECIMALS)
    const volume = bnOrZero(collection.priceStat?.volume).shiftedBy(-ZIL_DECIMALS);
    const holderCount = bnOrZero(collection.tokenStat.holderCount);
    const tokenCount = bnOrZero(collection.tokenStat.tokenCount);

    return {
      floorPrice: floorPrice.gt(0) ? toHumanNumber(floorPrice, 2) : undefined,
      volume: volume.gt(0) ? toHumanNumber(volume, 2) : undefined,
      holderCount: holderCount.gt(0) ? holderCount.toString(10) : undefined,
      tokenCount: tokenCount.gt(0) ? tokenCount.toString(10) : undefined,
    }
  }
}

const parseTraits = (traits: TraitsResponse): SimpleMap<TraitType> => {
  return traits.reduce((prev, curr) => {
    const { trait, values } = curr
    const v = Object.entries(values).reduce((acc, [k, v]) => ({ ...acc, [k]: { value: k, count: v } }), {})
    prev[trait] = { trait, values: v }
    return prev
  }, {} as SimpleMap<TraitType>)
}

const parseChequeSide = (side: string): "Sell" | "Buy" => {
  switch (side?.trim().toLowerCase()) {
    case "sell": return "Sell";
    case "buy": return "Buy";
    default: throw new Error(`unknown cheque side ${side}`);
  }
}

const serializeNFT = (brokerAddress: string, token: { id: string, address: string }): string => {
  let buffer = strToHex(`${brokerAddress}.NFT`);
  buffer += token.address.replace('0x', '').toLowerCase();
  buffer += serializeUint256(token.id);
  return buffer;
}

const serializePrice = (brokerAddress: string, price: { amount: BigNumber, address: string }): string => {
  let buffer = strToHex(`${brokerAddress}.Coins`)
  if (price.address === ZIL_HASH) {
    buffer += strToHex(`${brokerAddress}.Zil`)
  } else {
    buffer += strToHex(`${brokerAddress}.Token`)
    buffer += price.address.replace('0x', '').toLowerCase()
  }
  buffer += serializeUint128(price.amount)
  return buffer;
}

const serializeUint128 = (val: BigNumber | number | string): string => {
  return serializeUint(val, 16);
}

const serializeUint256 = (val: BigNumber | string): string => {
  return serializeUint(val, 32);
}

const serializeUint = (val: BigNumber | string | number, size: number): string => {
  const hexLength = size * 2;
  return "0".repeat(hexLength).concat(new BigNumber(val.toString()).toString(16)).slice(-hexLength);
}

const strToHex = (str: string): string => {
  return Array.from(
    new TextEncoder().encode(str),
    byte => byte.toString(16).padStart(2, "0")
  ).join("");
}

const sha256 = (byteHexString: string): string => {
  return crypto.createHash('sha256').update(Buffer.from(byteHexString, 'hex')).digest('hex')
}

export namespace ArkClient {
  export interface PostTradeParams {
    side: 'Buy' | 'Sell';
    tokenId: string;
    price: { amount: BigNumber, address: string };
    expiry: number;
    nonce: string;
    address: string;
    collectionAddress: string;
    publicKey: string;
    signature: string;
  }

  export type ExecuteBuyCheque = Pick<SimpleCheque, "side" | "expiry" | "publicKey" | "signature" | "nonce">;
  export type ExecuteSellCheque = Pick<SimpleCheque, "side" | "expiry" | "publicKey" | "signature" | "nonce" | "price" | "feeAmount" | "initiatorAddress">;
  export interface ArkChequeParams {
    side: 'Buy' | 'Sell';
    token: { id: string, address: string };
    price: { amount: BigNumber, address: string };
    feeAmount: BigNumber;
    expiry: number;
    nonce: string;
  }

  export type ExecuteTradeParams = {
    nftAddress: string;
    tokenId: string;
  } & ({
    sellCheque: SimpleCheque;
    buyCheque: ExecuteBuyCheque;
  } | {
    sellCheque: ExecuteSellCheque;
    buyCheque: SimpleCheque;
  })

  export interface VoidChequeParams {
    chequeHash: string;
    publicKey: string;
    signature: string;
    opts?: Partial<CallParams>;
  }

  export interface ListTokenParams extends ListQueryParams {
    search?: string;
    viewer?: string;
    owner?: string;
    likedBy?: string;
    collection?: string;
  }

  export interface SearchCollectionParams extends ListQueryParams {
    q?: string;
    search?: string;
    viewer?: string;
    type?: string;
    sortBy?: string;
    sortDir?: string;
  }
  export interface ListCollectionParams extends ListQueryParams {
    search?: string
  }
  export interface ListChequesParams extends ListQueryParams {
    collectionAddress?: string,
    tokenId?: string,
    side?: string,
    ownerAddress?: string,
    initiatorAddress?: string,
    isActive?: string,
  }
}

export const getChequeStatus = (cheque: Cheque, currentBlock: number): 'Active' | 'Expired' | 'Cancelled' | 'Accepted' => {
  if (cheque.cancelTransactionHash || cheque.invalidatedAt) return 'Cancelled'
  if (cheque.matchTransactionHash) return 'Accepted'
  if (cheque.expiry <= currentBlock) return 'Expired'
  return 'Active'
}
