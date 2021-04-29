import { HTTP } from "./http";
const DEFAULT_BLACKLIST_URL = "https://raw.githubusercontent.com/Switcheo/zilswap-webapp/master/dex_cex.json";

const http = new HTTP(DEFAULT_BLACKLIST_URL, {"/": ""});
const url = http.path("/");
let blacklist: string[] = [];

const initBlacklistedAddress = async () => {
  try {
    const response = await http.get({ url });
    const result = await response.json();
    if(result.addresses) {
      blacklist = result.addresses;
    }
  } catch (error) {
    console.error(error);
  }
}

initBlacklistedAddress();

export const isAddressBlacklisted = (addr: string | undefined): boolean => {
  if(!addr) {
    return false
  }
  if(blacklist.includes(addr.toLocaleLowerCase())) {
    return true;
  }
  return false;
}