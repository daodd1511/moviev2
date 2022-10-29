/* eslint-disable @typescript-eslint/promise-function-async */
import { FC, lazy } from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { movieRoutes } from '../features/Movie/routes';
import { tvRoutes } from '../features/Tv/routes';

export const NotFound = lazy(() =>
  import('../shared/components/NotFound').then(module => ({
    default: module.NotFound,
  })));

const routes: RouteObject[] = [
  {
    path: '',
    element: <Navigate to="/movie/discover/popular" />,
  },
  ...tvRoutes,
  ...movieRoutes,
  {
    path: '*',
    element: <NotFound />,
  },
];

/** Root router component. */
export const Router: FC = () => useRoutes(routes);
