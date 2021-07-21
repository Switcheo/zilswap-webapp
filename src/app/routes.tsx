import React, { lazy } from 'react';
import { RouteConfig } from 'react-router-config';
import { Redirect } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

const routes: RouteConfig[] = [{
  path: '/pools',
  component: MainLayout,
  routes: [{
    path: '/pools/overview',
    exact: true,
    component: lazy(() => import('./views/pools/PoolsOverview'))
  }, {
    path: '/pools/transactions',
    exact: true,
    component: lazy(() => import('./views/pools/PoolTransactions'))
  }, {
    component: () => <Redirect to="/pools/overview"></Redirect>
  }]
},
{
  path: '/zilo',
  component: MainLayout,
  routes: [{
    path: '/zilo/current',
    exact: true,
    component: lazy(() => import('./views/ilo/Current'))
  }, {
    path: '/zilo/past',
    exact: true,
    component: lazy(() => import('./views/ilo/Past'))
  }, {
    component: () => <Redirect to="/zilo/current"></Redirect>
  }]
},
{
  path: '/',
  component: MainLayout,
  routes: [{
    path: '/swap',
    exact: true,
    component: lazy(() => import('./views/main/Swap'))
  }, {
    path: '/pool',
    exact: true,
    component: lazy(() => import('./views/main/Pool'))
  }, {
    path: '/bridge',
    exact: true,
    component: lazy(() => import('./views/main/Bridge'))
  }, {
    path: '/history',
    exact: true,
    component: lazy(() => import('./views/bridge/TransferHistory'))

  }, {
    component: () => <Redirect to="/swap"></Redirect>
  }]
}];

export default routes;
