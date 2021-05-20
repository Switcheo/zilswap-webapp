import { NavigationOptions } from "./types";

const navigationConfig: NavigationOptions[] = [{
  pages: [{
    title: "Swap + Pool",
    href: "/swap",
    icon: "SwapHoriz",
    show: true,
  }, {
    title: "Pools Overview",
    href: "/pools",
    icon: "Layers",
    badge: "New",
  }, {
    title: "ZILO",
    href: "/ilo",
    badge: "New",
  }, {
    title: "Guide",
    href: "https://zilswap.gitbook.io/zilswap/",
    icon: "FileCopy",
    external: true,
    show: true,
  }, {
    title: "Governance",
    icon: "HowToVote",
    expand: true,
    items: [{
      title: "Voting",
      href: "https://vote.zilliqa.com/#/zwap/",
      external: true,
      show: true,
    }, {
      title: "Forum",
      href: "https://gov.zilswap.io",
      external: true,
      show: true,
    }]
  }, {
    title: "More",
    icon: "MoreHoriz",
    expand: true,
    items: [{
      title: "Developer",
      href: "https://docs.zilswap.org/#/smart-contract",
      external: true,
      show: true,
    }, {
      title: "Github",
      href: "https://github.com/Switcheo/zilswap",
      external: true,
      show: true,
    }, {
      title: "SDK",
      href: "https://github.com/Switcheo/zilswap-sdk",
      external: true,
      show: true,
    }, {
      title: "ZilStream",
      href: "https://zilstream.com",
      external: true,
      show: true,
    }]
  }, {
    title: "Buy ZIL",
    href: "https://transak.com/",
    icon: "LocalAtm",
    purchase: true,
    show: true,
    highlight: true
  }],
}];

export default navigationConfig;
