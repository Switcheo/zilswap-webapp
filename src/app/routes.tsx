import React, { lazy } from "react";
import { RouteConfig } from "react-router-config";
import { Redirect } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ArkLayout from "./layouts/ArkLayout";

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
    component: ArkLayout,
    routes: [
      {
        path: "/ark/discover",
        exact: true,
        component: lazy(() => import("./views/ark/Discover")),
      },
      {
        path: "/ark/collections/:collection",
        exact: true,
        component: lazy(() => import("./views/ark/CollectionView")),
      },
      {
        path: "/ark/collections/:collection/:id",
        exact: true,
        component: lazy(() => import("./views/ark/NftView")),
      },
      {
        path: "/ark/collections/:collection/:id/sell",
        exact: true,
        component: lazy(() => import("./views/ark/NftView/components/SellDialog")),
      },
      {
        path: "/ark/profile",
        exact: true,
        component: lazy(() => import("./views/ark/Profile")),
      },
      {
        path: "/ark/profile/:address",
        exact: true,
        component: lazy(() => import("./views/ark/Profile")),
      },
      {
        path: "/ark/profile/:address/edit",
        exact: true,
        component: lazy(() => import("./views/ark/Profile/components/EditProfile")),
      },
      {
        component: () => <Redirect to="/ark/discover"></Redirect>,
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
        path: "/history",
        exact: true,
        component: lazy(() => import("./views/bridge/TransferHistory")),
      },
      {
        component: () => <Redirect to="/swap"></Redirect>,
      },
    ],
  },
];

export default routes;
