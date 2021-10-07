import { Profile } from "app/store/types";
import { SimpleMap } from "app/utils";
import { HTTP } from "core/utilities";
import { ConnectedWallet } from "core/wallet";
import { fromBech32Address } from "core/zilswap";
import dayjs from "dayjs";
import { Network } from "zilswap-sdk/lib/constants";


const ARK_ENDPOINTS: SimpleMap<string> = {
  [Network.MainNet]: "https://api-ark.zilswap.org",
  [Network.TestNet]: "https://test-api-ark.zilswap.org",
} as const;

const apiEndpoints = {
  "oauth": "/oauth/access_token",
  "health/status": "/health/status",
  "collection/list": "/nft/collection/list",
  "collection/detail": "/nft/collection/:address/detail",
  "collection/search": "/nft/collection/:address/search",
  "collection/traits": "/nft/collection/:address/traits",
  "collection/token/detail": "/nft/collection/:address/:token_id/detail",
  "token/list": "/nft/token/list",
  "user/list": "/user/list",
  "user/detail": "/user/:address/detail",
  "user/update": "/user/:address/update",
};

const getHttpClient = (network: Network) => new HTTP(ARK_ENDPOINTS[network], apiEndpoints)

export interface ListQueryParams {
  limit?: number;
  offset?: number;
}

export class ArkClient {
  private http: HTTP<typeof apiEndpoints>;

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
  listCollection = async (params: ArkClient.ListCollectionParams) => {
    const url = this.http.path("collection/list", null, params);
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

  updateProfile = async (address: string, data: Profile) => {
    const url = this.http.path("user/update", { address })
    const result = await this.http.post({ url, data });
    return result.json();
  }
}

export namespace ArkClient {
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
