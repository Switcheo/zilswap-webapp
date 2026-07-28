// Blacklist of DEX/CEX deposit addresses, bundled at build time.
// This was previously fetched from raw.githubusercontent.com (repo master) at
// runtime — with the repo frozen, bundling avoids the remote-config pattern,
// the runtime GitHub dependency, and the extra CSP allowance.
import blacklist from "res/dex_cex.json";

const addresses: string[] = blacklist.addresses;

const isBlacklisted = (address: string) => {
  return addresses.includes(address);
};

const useBlacklistAddress = () => {
  return [isBlacklisted];
};

export default useBlacklistAddress;
