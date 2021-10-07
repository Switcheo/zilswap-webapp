import { Profile } from "app/store/types";
import { HTTP } from "core/utilities";
import { ConnectedWallet } from "core/wallet";
import dayjs from "dayjs";

const ARK_ENDPOINT = "https://api-ark.zilswap.org";
const DOMAIN = "zilswap.io";

const http = new HTTP(ARK_ENDPOINT, {
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
})

export const arkLogin = async (wallet: ConnectedWallet) => {
  const timestamp = dayjs().format("YYYY/MM/DD HH:mm:ss +0");
  const bech32Address = wallet.addressInfo.bech32;
  const signMessage = `[${timestamp}] ARK Authentication\nPlease issue my browser at ${DOMAIN} an ARK API key for my address:\n${bech32Address}`;

  const signResult = await (window as any).zilPay.wallet.sign(signMessage);
  const { message, publicKey, signature } = signResult
  const data = {
    grant_type: "signature",
    public_key: publicKey,
    signature,
    message
  }

  const url = http.path("oauth");
  const result = await http.post({ url, data });
  return result.json();
}

export const refreshToken = async (refresh_token: string) => {
  const data = {
    grant_type: "refresh_token",
    refresh_token
  }

  const url = http.path("oauth");
  const result = await http.post({ url, data });
  return result.json();
}

export const listCollection = async () => {
  const url = http.path("collection/list");
  const result = await http.get({ url });
  return result.json();
}

export const getProfile = async (address: string) => {
  const url = http.path("user/detail", { address });
  const result = await http.get({ url });
  return result.json();
}

export const getAddressTokens = async (owner: string) => {
  const url = http.path("token/list", null, { owner });
  const result = await http.get({ url });
  return result.json();
}

export const updateProfile = async (address: string, data: Profile) => {
  const url = http.path("user/update", { address })
  const result = await http.post({ url, data });
  return result.json();
}