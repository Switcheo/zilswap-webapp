import { SimpleMap } from "app/utils"

interface DrawerInfo {
  drawerText: string;
  navLink: string;
  highlightPaths: string[];
  connectedOnly?: boolean,
}

const DrawerConfig: SimpleMap<DrawerInfo[]> = {
  pool: [{
    drawerText: "Overview",
    navLink: "/pools/overview",
    highlightPaths: ["/pools/overview"],
  }, {
    drawerText: "Your Liquidity",
    navLink: "/pools/liquidity",
    highlightPaths: ["/pools/liquidity"],
    connectedOnly: true
  }, {
    drawerText: "Transactions",
    navLink: "/pools/transactions",
    highlightPaths: ["/pools/transactions"],
  },]
}

export default DrawerConfig