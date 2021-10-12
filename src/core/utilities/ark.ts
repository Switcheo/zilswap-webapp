import BigNumber from "bignumber.js";
import { OAuth, Profile } from "app/store/types";
import { SimpleMap } from "app/utils";
import { HTTP } from "core/utilities";
import { ConnectedWallet } from "core/wallet";
import { fromBech32Address } from "core/zilswap";
import crypto from "crypto";
import dayjs from "dayjs";
import { Network, ZIL_HASH } from "zilswap-sdk/lib/constants";

const ARK_ENDPOINTS: SimpleMap<string> = {
  [Network.MainNet]: "https://api-ark.zilswap.org",
  [Network.TestNet]: "https://test-api-ark.zilswap.org",
} as const;

const LOCALHOST_ENDPOINT = "http://localhost:8181";


export const ARK_CONTRACTS: { [key in Network]: string } = {
  [Network.MainNet]: '',
  [Network.TestNet]: 'zil1vf968mkk2372whae5ncd6w2h39p4nnqx2ut666',
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

  private http: HTTP<typeof apiPaths>;

  constructor(
    public readonly network: Network,
  ) {
    this.http = getHttpClient(network);
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
    return result.json();
  }

  refreshToken = async (refresh_token: string) => {
    const data = {
      grant_type: "refresh_token",
      refresh_token
    }

    const url = this.http.path("oauth");
    const result = await this.http.post({ url, data });
    return result.json();
  }
  listCollection = async (params?: ArkClient.ListCollectionParams) => {
    const url = this.http.path("collection/list", null, params);
    const result = await this.http.get({ url });
    return result.json();
  }

  getCollectionTraits = async (address: string) => {
    const url = this.http.path("collection/traits", { address });
    const result = await this.http.get({ url });
    return result.json();
  }

  getNftToken = async (address: string, tokenId: string) => {
    const url = this.http.path("collection/token/detail", { address, tokenId });
    const result = await this.http.get({ url });
    return result.json();
  }

  getNftCheques = async (collectionAddress: string, tokenId: string) => {
    const url = this.http.path("trade/list", {}, { collectionAddress, tokenId });
    const result = await this.http.get({ url });
    return result.json();
  }

  getProfile = async (address?: string) => {
    const url = this.http.path("user/detail", { address });
    const result = await this.http.get({ url });
    return result.json();
  }

  listTokens = async (params?: ArkClient.ListTokenParams) => {
    const url = this.http.path("token/list", null, params);
    const result = await this.http.get({ url });
    return result.json();
  }

  searchCollection = async (address: string, params?: ArkClient.SearchCollectionParams) => {
    if (address.startsWith("zil1"))
      address = fromBech32Address(address).toLowerCase();
    const url = this.http.path("collection/search", { address }, params);
    const result = await this.http.get({ url });
    return result.json();
  }

  updateProfile = async (address: string, data: Omit<Profile, "id" | "address">, oAuth: OAuth) => {
    const headers = { "authorization": "Bearer " + oAuth.access_token };
    const url = this.http.path("user/update", { address })
    const result = await this.http.post({ url, data, headers });
    return result.json();
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
    return result.json();
  };

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
    const brokerAddress = fromBech32Address(ARK_CONTRACTS[this.network]).toLowerCase()
    let buffer = strToHex(brokerAddress.replace('0x', ''))
    buffer += sha256(strToHex(`${brokerAddress}.${side}`))
    buffer += sha256(serializeNFT(brokerAddress, token))
    buffer += sha256(serializePrice(brokerAddress, price))
    buffer += sha256(serializeUint128(side === 'Buy' ? 0 : feeAmount))
    buffer += sha256(strToHex(expiry.toString())) // BNum is serialized as a String
    buffer += sha256(serializeUint128(nonce))
    return sha256(buffer)
  }
}

const serializeNFT = (brokerAddress: string, token: { id: string, address: string }): string => {
  let buffer = strToHex(`${brokerAddress}.NFT`)
  buffer += token.address.replace('0x', '').toLowerCase()
  buffer += serializeUint256(token.id)
  return buffer
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
  return buffer
}

const serializeUint128 = (val: BigNumber | number): string => {
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
    nonce: number;
    address: string;
    collectionAddress: string;
    publicKey: string;
    signature: string;
  }

  export interface ArkChequeParams {
    side: 'Buy' | 'Sell';
    token: { id: string, address: string };
    price: { amount: BigNumber, address: string };
    feeAmount: BigNumber;
    expiry: number;
    nonce: number;
  }
  export interface ListTokenParams extends ListQueryParams {
    owner?: string;
    collection?: string;
  }

  export interface SearchCollectionParams extends ListQueryParams {
    q?: string;
  }
  export interface ListCollectionParams extends ListQueryParams {
  }

}
