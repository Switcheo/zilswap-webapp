import crypto from "crypto";
import { BN, bytes, Long } from '@zilliqa-js/util';
import BigNumber from "bignumber.js";
import dayjs from "dayjs";
import { Zilswap } from "zilswap-sdk";
import { Network, ZIL_HASH } from "zilswap-sdk/lib/constants";
import { Cheque, OAuth, Profile, SimpleCheque } from "app/store/types";
import { SimpleMap } from "app/utils";
import { HTTP, logger } from "core/utilities";
import { ConnectedWallet } from "core/wallet";
import { fromBech32Address } from "core/zilswap";
import { CHAIN_IDS, MSG_VERSION } from "../zilswap/constants";

const ARK_ENDPOINTS: SimpleMap<string> = {
  [Network.MainNet]: "https://api-ark.zilswap.org",
  [Network.TestNet]: "https://test-api-ark.zilswap.org",
} as const;

const LOCALHOST_ENDPOINT = "http://localhost:8181";


export const ARK_CONTRACTS: { [key in Network]: { broker: string, tokenProxy: string } } = {
  [Network.MainNet]: { broker: '', tokenProxy: '' },
  [Network.TestNet]: { broker: 'zil1sgf3zpgt6qeflg053pxjwx9s9pxclx3p7s06gp', tokenProxy: 'zil1zmult8jp8q7wjpvjfalnaaue8v72nlcau53qcu' },
}

const apiPaths = {
  "oauth": "/oauth/access_token",
  "health/status": "/health/status",
  "collection/list": "/nft/collection/list",
  "collection/detail": "/nft/collection/:address/detail",
  "collection/search": "/nft/collection/:address/search",
  "collection/traits": "/nft/collection/:address/traits",
  "collection/token/detail": "/nft/collection/:address/:tokenId/detail",
  "token/list": "/nft/token/list",
  "trade/list": "/nft/trade/list",
  "trade/post": "/nft/trade/:address/:tokenId",
  "user/list": "/user/list",
  "user/detail": "/user/:address/detail",
  "user/update": "/user/:address/update",
  "user/image/request": "/user/:address/upload/request",
  "user/image/notify": "/user/:address/upload/notify"
};

const getHttpClient = (network: Network) => {
  const endpoint = process.env.REACT_APP_ARK_API_LOCALHOST === "true" ? LOCALHOST_ENDPOINT : ARK_ENDPOINTS[network];
  return new HTTP(endpoint, apiPaths);
}

export interface ListQueryParams {
  limit?: number;
  offset?: number;
}

export class ArkClient {
  public static FEE_BPS = 250;

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
    const timestamp = dayjs().format("YYYY/MM/DD HH:mm:ss +0");
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
  listCollection = async (params?: ArkClient.ListCollectionParams) => {
    const url = this.http.path("collection/list", null, params);
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  getCollectionTraits = async (address: string) => {
    const url = this.http.path("collection/traits", { address });
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  getNftToken = async (address: string, tokenId: string) => {
    const url = this.http.path("collection/token/detail", { address, tokenId });
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  getNftCheques = async (collectionAddress: string, tokenId: string) => {
    const url = this.http.path("trade/list", {}, { collectionAddress, tokenId });
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

  searchCollection = async (address: string, params?: ArkClient.SearchCollectionParams) => {
    if (address.startsWith("zil1"))
      address = fromBech32Address(address).toLowerCase();
    const url = this.http.path("collection/search", { address }, params);
    const result = await this.http.get({ url });
    const output = await result.json();
    await this.checkError(output);
    return output;
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

  requestImageUploadUrl = async (address: string, access_token: string) => {
    const headers = { Authorization: "Bearer " + access_token };
    const url = this.http.path("user/image/request", { address }, { type: "profile" });
    const result = await this.http.get({ url, headers });
    const output = await result.json();
    await this.checkError(output);
    return output;
  }

  putImageUpload = async (url: string, data: Blob, file: File) => {
    // const headers = { "Content-Length": file.size, "Content-Type": file.type, 'Access-Control-Allow-Origin': '*' }
    await this.http.put({ url, data });
    return
  }

  notifyUpload = async (address: string, access_token: string) => {
    const headers = { Authorization: "Bearer " + access_token };
    const url = this.http.path("user/image/notify", { address }, { type: "profile" });
    const result = await this.http.post({ url, headers });
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
    const brokerAddress = this.brokerAddress
    let buffer = serializeValue(brokerAddress)
    buffer += sha256(strToHex(`${brokerAddress}.${side}`))
    buffer += sha256(serializeNFT(brokerAddress, token))
    buffer += sha256(serializePrice(brokerAddress, price))
    buffer += sha256(serializeUint128(side === 'Buy' ? 0 : feeAmount))
    buffer += sha256(strToHex(expiry.toString())) // BNum is serialized as a String
    buffer += sha256(serializeUint128(nonce))
    return sha256(buffer)
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
    if (userApprovals[this.brokerAddress]) return null;

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
  async executeTrade(executeParams: ArkClient.ExecuteTradeParams, zilswap: Zilswap) {
    const { nftAddress, tokenId, sellCheque, buyCheque } = executeParams;
    const { address: priceTokenAddress, amount: priceAmount } = sellCheque.price;

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

    const minGasPrice = (await zilswap.zilliqa.blockchain.getMinimumGasPrice()).result as string;
    const callParams = {
      amount: priceTokenAddress === ZIL_HASH ? new BN(priceAmount) : new BN(0),
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
      _serialization: {
        numByteSize: { 1: 32 }
      },
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
}

const parseChequeSide = (side: string): "Sell" | "Buy" => {
  switch (side?.trim().toLowerCase()) {
    case "sell": return "Sell";
    case "buy": return "Buy";
    default: throw new Error(`unknown cheque side ${side}`);
  }
}

const serializeValue = (val: any, numByteSize = 16) => {
  if (val.arguments) {
    return serializeADT(val)
  } else if (val.startsWith('0x')) {
    return val.replace('0x', '').toLowerCase()
  } else if (!new BigNumber(val).isNaN()) {
    return serializeUint(val, numByteSize);
  } else {
    return strToHex(val)
  }
}

const serializeADT = (adt: any) => {
  let buffer = strToHex(adt.constructor)
  adt.arguments.forEach((arg: any, i: number) => {
    const numByteSize = adt._serialization?.numByteSize?.[i]
    buffer += serializeValue(arg, numByteSize)
  })
  return buffer
}

const serializeNFT = (brokerAddress: string, token: { id: string, address: string }): string => {
  return serializeValue({
    constructor: `${brokerAddress}.NFT`,
    arguments: [
      token.address,
      token.id,
    ],
    _serialization: {
      numByteSize: { 1: 32 }
    },
  })
}

const serializePrice = (brokerAddress: string, price: { amount: BigNumber, address: string }): string => {
  const isZil = price.address === ZIL_HASH;
  return serializeValue({
    arguments: [
      {
        argtypes: [],
        arguments: isZil ? [] : [price.address],
        constructor: isZil ? `${brokerAddress}.Zil` : `${brokerAddress}.Token`,
      },
      price.amount.toString(10)
    ],
    constructor: `${brokerAddress}.Coins`,
  })
}

const serializeUint128 = (val: BigNumber | number): string => {
  return serializeUint(val, 16);
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
    nonce: BigNumber;
    address: string;
    collectionAddress: string;
    publicKey: string;
    signature: string;
  }

  export type ExecuteBuyCheque = Pick<SimpleCheque, "side" | "expiry" | "publicKey" | "signature" | "nonce">;
  export interface ArkChequeParams {
    side: 'Buy' | 'Sell';
    token: { id: string, address: string };
    price: { amount: BigNumber, address: string };
    feeAmount: BigNumber;
    expiry: number;
    nonce: BigNumber;
  }

  export interface ExecuteTradeParams {
    nftAddress: string;
    tokenId: string;
    sellCheque: SimpleCheque;
    buyCheque: ExecuteBuyCheque;
  }

  export interface ListTokenParams extends ListQueryParams {
    owner?: string;
    collection?: string;
  }

  export interface SearchCollectionParams extends ListQueryParams {
    q?: string;
    viewer?: string;
    sort?: string;
    sortDir?: string;
  }
  export interface ListCollectionParams extends ListQueryParams {
  }
}

export const getChequeStatus = (cheque: Cheque, currentBlock: number): 'Active' | 'Expired' | 'Cancelled' | 'Accepted' => {
  if (cheque.cancelTransactionHash) return 'Cancelled'
  if (cheque.matchTransactionHash) return 'Accepted'
  if (cheque.expiry <= currentBlock) return 'Expired'
  return 'Active'
}
