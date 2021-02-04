import { NavigationOptions } from "./types";

const navigationConfig: NavigationOptions[] = [{
  pages: [{
    title: "Swap",
    href: "/swap",
    show: true,
  }, {
    title: "Pools Overview",
    href: "/pools",
    badge: "New",
  }, {
    title: "About",
    href: "https://docs.zilswap.org/#/?id=introduction",
    external: true,
    show: true,
  }, {
    title: "Documentation",
    href: "https://docs.zilswap.org/#/smart-contract",
    external: true,
    show: true,
  }, {
    title: "API",
    href: "https://github.com/Switcheo/zilswap-sdk",
    external: true,
    show: true,
  }],
}];

export default navigationConfig;
