import crypto from "crypto";
import { CallParams, Contract } from '@zilliqa-js/contract'
import { BN, bytes, Long } from '@zilliqa-js/util';
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { Zilswap } from "zilswap-sdk";
import { Network, ZIL_HASH } from "zilswap-sdk/lib/constants";
import { Cheque, Collection, CollectionWithStats, Nft, OAuth, Profile, SimpleCheque, TraitType, QueryNftResult, PaginatedList } from "app/store/types";
import { bnOrZero, getZilChainId, SimpleMap, toHumanNumber } from "app/utils";
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


export const ARK_CONTRACTS_V1: { [key in Network]: { broker: string, tokenProxy: string } } = {
  [Network.MainNet]: { broker: 'zil1jna6pq6fsjsxdkvkz2wyt6tg80p762neqkz2qh', tokenProxy: 'zil1yrqlm8cxpqt8wq5y6axejvcs2h350ykj9cc758' },
  [Network.TestNet]: { broker: 'zil1nyapz27kck9tteejccfr354tnx89s2sddfzqpl', tokenProxy: 'zil1hfp8fn6026kvel2zc25xztk3lss68nlmqmm2fn' },
}
export const ARK_CONTRACTS_V2: { [key in Network]: { broker: string, tokenProxy: string } } = {
  [Network.MainNet]: { broker: 'zil1twg0esku5syp408dslzpmsy5nuaq4xsr9c9jqc', tokenProxy: 'zil1zwpvukgdf4jyxl808wncdvfwzdc8utkfj25uxx' },
  [Network.TestNet]: { broker: 'zil1hapz8zfuq5lhhvwah5s6pu3gg9f044jsfz4n5e', tokenProxy: 'zil1l66xztqzpg5mshw6a3ulw9ue40w8gksgmmay6g' },
}

const apiPaths = {
  "oauth": "/oauth/access_token",
  "exchange/status": "/exchange/status",
  "exchange/info": "/exchange/info",
  "collection/list": "/nft/collection/list",
  "collection/deploy": "/nft/collection/:address/deploy",
  "collection/detail": "/nft/collection/:address/detail",
  "collection/mint": "/nft/collection/:address/mint",
  "collection/search": "/nft/collection/:address/search",
  "collection/traits": "/nft/collection/:address/traits",
  "collection/token/detail": "/nft/collection/:address/:tokenId/detail",
  "collection/token/history": "/nft/collection/:address/:tokenId/history",
  "collection/resync/metadata": "/nft/collection/:collectionAddress/:tokenId/resync",
  "collection/image/request": "/admin/collection/:address/upload/request",
  "collection/update": "/admin/collection/:address/update",
  "token/favourite": "/nft/collection/:address/:tokenId/favourite",
  "history/floor": "/nft/history/floor",
  "history/saleprice": "/nft/history/saleprice",
  "history/bidprice": "/nft/history/bidprice",
  "token/list": "/nft/token/list",
  "trade/list": "/nft/trade/list",
  "trade/post": "/nft/trade/:address/:tokenId",
  "user/list": "/user/list",
  "user/detail": "/user/:address/detail",
  "user/update": "/user/:address/update",
  "user/image/request": "/user/:address/upload/request",
  "user/image/notify": "/user/:address/upload/notify",
  "user/image/remove": "/user/:address/upload/remove",
  "user/image/profile": "/user/:address/upload/profile",
  "mint/deploy": "/nft/mint/deploy",
  "mint/check": "/nft/mint/check",
  "mint/detail": "/nft/mint/:mintContractId/detail",
  "mint/image/request": "/nft/mint/:mintContractId/upload/request",
  "mint/image/notify": "/nft/mint/:mintContractId/upload/notify",
};

const getHttpClient = (network: Network) => {
  const endpoint = process.env.REACT_APP_ARK_API_LOCALHOST === "true" ? LOCALHOST_ENDPOINT : ARK_ENDPOINTS[network];
  return new HTTP(endpoint, apiPaths);
}

export interface ArkContractInfo {
  brokerAddress: string,
  tokenProxyAddress: string,
  note?: string,
}

export interface ArkExchangeInfo {
  network: Network;
  brokerAddress: string;
  tokenProxyAddress: string;
  featuredCollections: string[];
  baseFeeBps: number;
  denoms: string[];

  contracts: {
    v1: ArkContractInfo,
    v2: ArkContractInfo,
  },
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
  public readonly brokerAddressV1: string;
  public readonly tokenProxyAddressV1: string;
  public readonly brokerAddressV2: string;
  public readonly tokenProxyAddressV2: string;
  private http: HTTP<typeof apiPaths>;

  constructor(
    public readonly network: Network,
  ) {
    this.http = getHttpClient(network);
    this.brokerAddressV1 = fromBech32Address(ARK_CONTRACTS_V1[network].broker).toLowerCase();
    this.tokenProxyAddressV1 = fromBech32Address(ARK_CONTRACTS_V1[network].tokenProxy).toLowerCase();
    this.brokerAddressV2 = fromBech32Address(ARK_CONTRACTS_V2[network].broker).toLowerCase();
    this.tokenProxyAddressV2 = fromBech32Address(ARK_CONTRACTS_V2[network].tokenProxy).toLowerCase();
  }

  getTokenProxyForBrokerAddress = (brokerAddress: string) => {
    switch (brokerAddress) {
      case this.brokerAddressV1: return this.tokenProxyAddressV1;
      case this.brokerAddressV2: return this.tokenProxyAddressV2;
      default: throw new Error(`unrecognized broker address ${brokerAddress}`);
    }
  };

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
    const signMessage = `[${timestamp}] ARKY Authentication\nPlease issue my browser at ${hostname} an ARKY API key for my address:\n${bech32Address}`;

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
    const { limit = 100, ...rest } = params ?? {};
    const url = this.http.path("collection/list", null, { limit, ...rest });
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
    return { traits: parseTraits(traits), collection: { ...json.result.collection, artists: json.result.artists } }
  }

  getNftToken = async (address: string, tokenId: string, viewer?: string) => {
    const url = this.http.path("collection/token/detail", { address, tokenId }, { viewer });
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  getNftTokenHistory = async (address: string, tokenId: string, viewer?: string) => {
    const url = this.http.path("collection/token/history", { address, tokenId }, { viewer });
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  getCollectionFloor = async (params: ArkClient.CollectionFloorParams) => {
    const url = this.http.path("history/floor", {}, params);
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  getSalePrice = async (params: ArkClient.SalePriceParams) => {
    const url = this.http.path("history/saleprice", {}, params);
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  getBidPrice = async (params: ArkClient.BidPriceParams) => {
    const url = this.http.path("history/bidprice", {}, params);
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

  getProfile = async (address: string, oAuth?: OAuth) => {
    const headers: SimpleMap = {};
    if (oAuth?.access_token) {
      headers.authorization = "Bearer " + oAuth.access_token;
    }
    const url = this.http.path("user/detail", { address });
    const result = await this.http.get({ url, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  listTokens = async (params?: ArkClient.ListTokenParams) => {
    const url = this.http.path("token/list", null, params);
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output.result as PaginatedList<Nft>;
  }

  searchCollection = async (address: string, params?: ArkClient.SearchCollectionParams):
    Promise<QueryNftResult> => {
    if (address.startsWith("zil1"))
      address = fromBech32Address(address).toLowerCase();
    const url = this.http.path("collection/search", { address }, params);
    const result = await this.http.get({ url });
    const json = await result.json();
    await this.checkError(json);

    const traits = json.result.extras.traits as TraitsResponse
    return { traits: parseTraits(traits), entries: json.result.entries, meta: json.result.meta }
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

  requestCollectionImageUploadUrl = async (address: string, access_token: string, type = "profile") => {
    const headers = { Authorization: "Bearer " + access_token };
    const url = this.http.path("collection/image/request", { address }, { type });
    const result = await this.http.get({ url, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  updateCollection = async (address: string, data: Omit<Collection, "address">, oAuth: OAuth) => {
    const headers = { "authorization": "Bearer " + oAuth.access_token };
    const url = this.http.path("collection/update", { address })
    const result = await this.http.post({ url, data, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  };

  deployCollection = async (data: ArkClient.DeployCollectionParams, access_token: string) => {
    const headers = { "authorization": "Bearer " + access_token };
    const url = this.http.path("mint/deploy");
    const result = await this.http.post({ url, data, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  mintDetail = async (mintContractId: string, access_token: string) => {
    const headers = { "authorization": "Bearer " + access_token };
    const url = this.http.path("mint/detail", { mintContractId });
    const result = await this.http.get({ url, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  getOngoingMint = async (access_token: string) => {
    const headers = { "authorization": "Bearer " + access_token };
    const url = this.http.path("mint/check");
    const result = await this.http.get({ url, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  requestMintImageUploadUrl = async (mintContractId: string, access_token: string, type: string) => {
    const headers = { "authorization": "Bearer " + access_token };
    const url = this.http.path("mint/image/request", { mintContractId }, { type });
    const result = await this.http.get({ url, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  notifyMintImageUpload = async (mintContractId: string, access_token: string, type: string) => {
    const headers = { "authorization": "Bearer " + access_token };
    const url = this.http.path("mint/image/notify", { mintContractId }, { type });
    const result = await this.http.post({ url, headers });
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

  setNFTAsProfile = async (address: string, access_token: string, collection: string, token: string) => {
    const headers = { Authorization: "Bearer " + access_token };
    const url = this.http.path("user/image/profile", { address });
    const result = await this.http.post({ url, headers, data: { collection, token } });
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
   * @param chainId - used for V2 signature generation
   * @returns
   */
  arkMessage = (type: 'Execute' | 'Void', chequeHash: string, brokerAddress: string) => {
    const isLegacyBrokerAddress = brokerAddress !== this.brokerAddressV2;
    const chainId = getZilChainId(this.network);
    const signHeader = isLegacyBrokerAddress ? `Zilliqa Signed Message:\n` : `Zilliqa Signed Message (${chainId}):\n`;
    return `${signHeader}${type} ARK Cheque 0x${chequeHash}`
  }

  /**
   * Computes the cheque hash for a trade intent on ARK.
   * @param params - trade parameters
   * @returns
   */
  arkChequeHash = (params: ArkClient.ArkChequeParams): string => {
    const { side, token, price, feeAmount, expiry, nonce, brokerAddress } = params
    if (token.address.startsWith("zil1"))
      token.address = fromBech32Address(token.address);
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

  // TODO: Refactor zilswap SDK as instance member;
  async approveAllowanceIfRequired(tokenAddress: string, ownerAddress: string, brokerAddress: string, zilswap: Zilswap) {
    const response = await zilswap.zilliqa.blockchain.getSmartContractSubState(tokenAddress, "operator_approvals");
    const approvalState = response.result?.operator_approvals;

    // if no operator_approvals, check for operators
    if (!approvalState) {
      const zrc6Response = await zilswap.zilliqa.blockchain.getSmartContractSubState(tokenAddress, "operators", [ownerAddress.toLowerCase()]);
      const zrc6ApprovalState = zrc6Response.result?.operators;
      if (zrc6ApprovalState?.[ownerAddress.toLowerCase()]?.[brokerAddress]) return null;
      // use zrc6 transition
      return await this.zrc6ApproveAllowance(tokenAddress, brokerAddress, zilswap);
    }

    const userApprovals = approvalState?.[ownerAddress.toLowerCase()];
    logger("ark contract approvals", ownerAddress, brokerAddress, userApprovals);
    if (userApprovals?.[brokerAddress]) return null;

    return await this.approveAllowance(tokenAddress, brokerAddress, zilswap);
  }

  async zrc6ApproveAllowance(tokenAddress: string, brokerAddress: string, zilswap: Zilswap) {
    const args = [{
      vname: "operator",
      type: "ByStr20",
      value: brokerAddress,
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
      "AddOperator",
      args as any,
      callParams,
      true,
    );

    return result;
  }

  // TODO: Refactor zilswap SDK as instance member;
  async approveAllowance(tokenAddress: string, brokerAddress: string, zilswap: Zilswap) {
    const args = [{
      vname: "to",
      type: "ByStr20",
      value: brokerAddress,
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

  async acceptContractOwnership(contractAddress: string, zilswap: Zilswap) {
    const minGasPrice = (await zilswap.zilliqa.blockchain.getMinimumGasPrice()).result as string;
    const callParams = {
      amount: new BN("0"),
      gasPrice: new BN(minGasPrice),
      gasLimit: Long.fromNumber(20000),
      version: bytes.pack(CHAIN_IDS[this.network], MSG_VERSION),
    };

    const result = await zilswap.callContract(
      zilswap.getContract(contractAddress),
      "AcceptContractOwnership",
      [],
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
    const { nftAddress, tokenId, sellCheque, buyCheque, brokerAddress } = executeParams;
    const { address: priceTokenAddress, amount: priceAmount } = sellCheque.price;
    const userAddress = wallet?.addressInfo.byte20.toLowerCase();

    const args = [{
      vname: "token",
      type: `${brokerAddress}.NFT`,
      value: this.toAdtNft(brokerAddress, nftAddress, tokenId),
    }, {
      vname: "price",
      type: `${brokerAddress}.Coins`,
      value: this.toAdtPrice(brokerAddress, priceTokenAddress, priceAmount),
    }, {
      vname: "fee_amount",
      type: "Uint128",
      value: sellCheque.feeAmount.toString(),
    }, {
      vname: 'sell_cheque',
      type: `${brokerAddress}.Cheque`,
      value: this.toAdtCheque(brokerAddress, sellCheque)
    }, {
      vname: 'buy_cheque',
      type: `${brokerAddress}.Cheque`,
      value: this.toAdtCheque(brokerAddress, buyCheque)
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
      zilswap.getContract(brokerAddress),
      "ExecuteTrade",
      args as any,
      callParams,
      true,
    );

    return result;
  }

  // TODO: Refactor zilswap SDK as instance member;
  async voidCheque(voidChequeParams: ArkClient.VoidChequeParams, zilswap: Zilswap) {
    const { publicKey, signature, chequeHash, brokerAddress } = voidChequeParams;

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
      zilswap.getContract(brokerAddress),
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
  toAdtNft(brokerAddress: string, nftAddress: string, tokenId: string) {
    if (nftAddress.startsWith("zil"))
      nftAddress = fromBech32Address(nftAddress).toLowerCase();
    return {
      argtypes: [],
      arguments: [nftAddress, tokenId],
      constructor: `${brokerAddress}.NFT`,
    }
  }

  /**
   *
   * @param tokenAddress hex address of zrc2 contract starting with 0x
   * @returns
   */
  toAdtToken(brokerAddress: string, tokenAddress: string) {
    if (tokenAddress.startsWith("zil"))
      tokenAddress = fromBech32Address(tokenAddress).toLowerCase();

    if (tokenAddress === ZIL_HASH)
      return {
        argtypes: [],
        arguments: [],
        constructor: `${brokerAddress}.Zil`,
      };

    return {
      argtypes: [],
      arguments: [tokenAddress],
      constructor: `${brokerAddress}.Token`,
    };
  }

  /**
   *
   * @param tokenAddress hex address of zrc2 contract starting with 0x
   * @param amountUnitless amount in unitless form
   */
  toAdtPrice(brokerAddress: string, tokenAddress: string, amountUnitless: string) {
    return {
      argtypes: [],
      arguments: [
        this.toAdtToken(brokerAddress, tokenAddress),
        amountUnitless.toString(),
      ],
      constructor: `${brokerAddress}.Coins`,
    }
  }

  toAdtChequeSide(brokerAddress: string, side: string) {
    const _side = parseChequeSide(side);
    return {
      argtypes: [],
      arguments: [],
      constructor: `${brokerAddress}.${_side}`,
    };
  }

  toAdtCheque(brokerAddress: string, cheque: ArkClient.ExecuteBuyCheque) {
    return {
      argtypes: [],
      arguments: [
        this.toAdtChequeSide(brokerAddress, cheque.side),
        cheque.expiry.toString(10),
        cheque.nonce.toString(),
        cheque.publicKey,
        cheque.signature,
      ],
      constructor: `${brokerAddress}.Cheque`,
    }
  }

  static parseCollectionStats(collection: CollectionWithStats) {
    const floorPrice = bnOrZero(collection.priceStat?.floorPrice).shiftedBy(-ZIL_DECIMALS)
    const volume = bnOrZero(collection.priceStat?.volume).shiftedBy(-ZIL_DECIMALS);
    const allTimeVolume = bnOrZero(collection.priceStat?.allTimeVolume).shiftedBy(-ZIL_DECIMALS);
    const holderCount = bnOrZero(collection.tokenStat.holderCount);
    const tokenCount = bnOrZero(collection.tokenStat.tokenCount);

    return {
      floorPrice: floorPrice.gt(0) ? toHumanNumber(floorPrice, 2) : undefined,
      volume: volume.gt(0) ? toHumanNumber(volume, 2) : undefined,
      allTimeVolume: allTimeVolume.gt(0) ? toHumanNumber(allTimeVolume, 2) : undefined,
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
    brokerAddress: string;
  }

  export type ExecuteTradeParams = {
    nftAddress: string;
    tokenId: string;
    brokerAddress: string;
  } & ({
    sellCheque: SimpleCheque;
    buyCheque: ExecuteBuyCheque;
  } | {
    sellCheque: ExecuteSellCheque;
    buyCheque: SimpleCheque;
  })

  export interface VoidChequeParams {
    chequeHash: string;
    brokerAddress: string;
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

  export interface TokenTrait {
    trait_type: string;
    value: string;
  }

  export interface TokenMetadata {
    attributes: TokenTrait[];
    name: string;
    description?: string;
  }

  export interface TokenParam {
    resourceIpfsHash: string;
    metadata: TokenMetadata;
  }

  export interface DeployCollectionParams {
    collection: Collection;
    tokens: TokenParam[];
  }

  export interface MintCollectionParams {
    contract: Contract;
    tokenUris: Array<string>;
  }

  export interface SearchCollectionParams extends ListQueryParams {
    q?: string;
    search?: string;
    viewer?: string;
    type?: string;
    sortBy?: string;
    sortDir?: string;
    artist?: string;
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
  export interface CollectionFloorParams extends ListQueryParams {
    collection: string,
    interval: string,
  }
  export interface SalePriceParams extends ListQueryParams {
    collection: string,
    tokenId: string,
    interval: string,
  }
  export interface BidPriceParams extends ListQueryParams {
    collection: string,
    tokenId: string,
    interval: string,
  }
}

export const getChequeStatus = (cheque: Cheque, currentBlock: number): 'Active' | 'Expired' | 'Cancelled' | 'Accepted' => {
  if (cheque.cancelTransactionHash || cheque.invalidatedAt) return 'Cancelled'
  if (cheque.matchTransactionHash) return 'Accepted'
  if (cheque.expiry <= currentBlock) return 'Expired'
  return 'Active'
}
