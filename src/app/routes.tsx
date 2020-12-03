import React, { lazy } from 'react';
import { Redirect } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { RouteConfig } from 'react-router-config';


const routes: RouteConfig[] = [{
  path: '/pools',
  component: MainLayout,
  routes: [{
    path: '/pools/overview',
    exact: true,
    component: lazy(() => import('./views/pools/PoolsOverview'))
  }, {
    component: () => <Redirect to="/pools/overview"></Redirect>
  }]
}, {
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
