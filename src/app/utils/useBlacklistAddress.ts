import { HTTP } from "core/utilities";

const ADDR_BLACKLIST_URL = "https://raw.githubusercontent.com/Switcheo/zilswap-webapp/master/src/res/dex_cex.json";

const http = new HTTP(ADDR_BLACKLIST_URL, { "/": "" });
const url = http.path("/");
let addresses: string[] | undefined;
let loading = false;

const initializeList = async () => {
  if (loading) return;

  loading = true;
  try {
    const response = await http.get({ url });
    const result = await response.json();
    if (result.addresses) {
      addresses = result.addresses;
    }
  } catch (error) {
    // fail silently
    console.error(error);
  } finally {
    loading = false;
  }
};

const isBlacklisted = (address: string) => {
  initializeList();
  // coalesce undefined into false
  return addresses?.includes(address) === true;
};

const useBlacklistAddress = () => {
  initializeList();
  return [isBlacklisted];
};

export default useBlacklistAddress;
