import { NavigationOptions } from "./types";

const navigationConfig: NavigationOptions[] = [{
  pages: [{
    title: "Swap",
    href: "/swap",
  }, {
    title: "Documentation",
    href: "https://docs.zilswap.org/",
    external: true,
  }, {
    title: "API",
    href: "https://docs.zilswap.org/#/smart-contract",
    external: true,
  }, {
    title: "Support",
    href: "/support",
  }],
}];

export default navigationConfig;
