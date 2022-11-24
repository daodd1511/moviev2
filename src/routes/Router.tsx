/* eslint-disable @typescript-eslint/promise-function-async */
import { FC, lazy } from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { NoAuthGuard } from './guards/NoAuthGuard';

import { movieRoutes } from '@/features/Movie/routes';
import { tvRoutes } from '@/features/Tv/routes';
import { userRoutes } from '@/features/User/routes';
import { authRoutes } from '@/features/Auth/routes';
import { WithoutNavbar, WithNavbar } from '@/shared/components/Navbar/';
import { Test } from '@/features/Test';
import { listRoutes } from '@/features/List/routes';

export const NotFound = lazy(() =>
  import('../shared/components/NotFound').then(module => ({
    default: module.NotFound,
  })));

const routes: RouteObject[] = [
  {
    path: '',
    element: <Navigate to="/movie/discover/popular" />,
  },
  {
    element: <WithNavbar />,
    children: [...movieRoutes, ...tvRoutes, ...userRoutes, ...listRoutes],
  },
  {
    path: 'auth',
    element: <NoAuthGuard />,
    children: [
      {
        element: <WithoutNavbar />,
        children: [...authRoutes],
      },
    ],
  },
  {
    path: 'test',
    element: <Test />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

/** Root router component. */
export const Router: FC = () => useRoutes(routes);
