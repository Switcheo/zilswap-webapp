import React, { lazy } from "react";
import { RouteConfig } from "react-router-config";
import { Redirect } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ArkLayout from "./layouts/ArkLayout";
import { ArkRedirect } from "./components";

const routes: RouteConfig[] = [
  {
    path: "/pools",
    component: MainLayout,
    routes: [
      {
        path: "/pools/overview",
        exact: true,
        component: lazy(() => import("./views/pools/PoolsOverview")),
      },
      {
        path: "/pools/transactions",
        exact: true,
        component: lazy(() => import("./views/pools/PoolTransactions")),
      },
      {
        path: "/pools/liquidity",
        exact: true,
        component: lazy(() => import("./views/pools/PoolLiquidity")),
      },
      {
        component: () => <Redirect to="/pools/overview"></Redirect>,
      },
    ],
  },
  {
    path: "/zilo",
    component: MainLayout,
    routes: [
      {
        path: "/zilo/current",
        exact: true,
        component: lazy(() => import("./views/ilo/Current")),
      },
      {
        path: "/zilo/past",
        exact: true,
        component: lazy(() => import("./views/ilo/Past")),
      },
      {
        component: () => <Redirect to="/zilo/current"></Redirect>,
      },
    ],
  },
  {
    path: "/ark",
    component: () => <ArkRedirect />
  },
  {
    path: "/arky",
    component: ArkLayout,
    routes: [
      {
        path: "/arky/discover",
        exact: true,
        component: lazy(() => import("./views/ark/Discover")),
      },
      {
        path: "/arky/collections/:collection",
        exact: true,
        component: lazy(() => import("./views/ark/CollectionView")),
      },
      {
        path: "/arky/mod/:collection/modify",
        exact: true,
        component: lazy(() => import("./views/ark/EditCollection")),
      },
      {
        path: "/arky/collections/:collection/:id",
        exact: true,
        component: lazy(() => import("./views/ark/NftView")),
      },
      {
        path: "/arky/collections/:collection/:id/sell",
        exact: true,
        component: lazy(() => import("./views/ark/NftView/components/SellDialog")),
      },
      {
        path: "/arky/profile",
        exact: true,
        component: lazy(() => import("./views/ark/Profile")),
      },
      {
        path: "/arky/profile/:address",
        exact: true,
        component: lazy(() => import("./views/ark/Profile")),
      },
      {
        path: "/arky/profile/:address/edit",
        exact: true,
        component: lazy(() => import("./views/ark/Profile/components/EditProfile")),
      },
      {
        path: "/arky/mint",
        exact: true,
        component: lazy(() => import("./views/ark/Mint")),
      },
      {
        component: () => <Redirect to="/arky/discover"></Redirect>,
      },
    ],
  },
  {
    path: "/",
    component: MainLayout,
    routes: [
      {
        path: "/swap",
        exact: true,
        component: lazy(() => import("./views/main/Swap")),
      },
      {
        path: "/pool",
        exact: true,
        component: lazy(() => import("./views/main/Pool")),
      },
      {
        path: "/bridge",
        exact: true,
        component: lazy(() => import("./views/main/Bridge")),
      },
      {
        path: "/bridge/erc20-zil-swap",
        exact: true,
        component: lazy(() => import("./views/bridge/ZilErc20TokenSwap")),
      },
      {
        path: "/history",
        exact: true,
        component: lazy(() => import("./views/bridge/TransferHistory")),
      },
      {
        path: "/bridge/erc20-zil-upgrade",
        component: () => <Redirect to="/bridge/erc20-zil-swap"></Redirect>,
      },
      {
        component: () => <Redirect to="/swap"></Redirect>,
      },
    ],
  },
];

export default routes;
