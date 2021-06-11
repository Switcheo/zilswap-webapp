import React, { lazy } from 'react';
import { RouteConfig } from 'react-router-config';
import { Redirect } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { isProduction } from './utils/constants';

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
...!isProduction() ? [{
  path: '/ilo',
  component: MainLayout,
  routes: [{
    path: '/ilo/current',
    exact: true,
    component: lazy(() => import('./views/ilo/Current'))
  }, {
    path: '/ilo/past',
    exact: true,
    component: lazy(() => import('./views/ilo/Past'))
  }, {
    component: () => <Redirect to="/ilo/current"></Redirect>
  }]
}] : []
  , {
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
    component: () => <Redirect to="/swap"></Redirect>
  }]
}];

export default routes;
