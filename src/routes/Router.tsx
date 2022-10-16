/* eslint-disable @typescript-eslint/promise-function-async */
import { FC, lazy } from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { movieRoutes } from './movies.routes';

export const NotFound = lazy(() =>
  import('../pages/NotFound').then(module => ({
    default: module.NotFound,
  })));

export const Movie = lazy(() =>
  import('../pages/Movie').then(module => ({
    default: module.Movie,
  })));

const routes: RouteObject[] = [
  {
    path: '',
    element: <Navigate to="/movie/popular" />,
  },
  ...movieRoutes,
  {
    path: 'movie/detail/:id',
    element: <Movie />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

/** Root router component. */
export const Router: FC = () => useRoutes(routes);
