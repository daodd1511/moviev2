import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

export const Login = lazy(() =>
  import('./pages/LoginPage').then(module => ({
    default: module.LoginPage,
  })));

export const authRoutes: RouteObject[] = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        element: <Login />,
      },

    //   {
    //     path: 'register',
    //     element: <TvByDiscover />,
    //   },
    ],
  },
];
