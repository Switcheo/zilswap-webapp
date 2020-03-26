/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React, { lazy } from 'react';
import { Redirect } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { RouteConfig } from 'react-router-config';


const routes: RouteConfig[] = [{
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
