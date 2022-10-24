/* eslint-disable @typescript-eslint/promise-function-async */
import { FC, lazy } from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { movieRoutes } from './movie.routes';
import { tvRoutes } from './tv.routes';

export const NotFound = lazy(() =>
  import('../pages/NotFound').then(module => ({
    default: module.NotFound,
  })));

export const Movie = lazy(() =>
  import('../pages/Movie').then(module => ({
    default: module.Movie,
  })));

export const Tv = lazy(() =>
  import('../pages/TV').then(module => ({
    default: module.TV,
  })));

const routes: RouteObject[] = [
  {
    path: '',
    element: <Navigate to="/movie/discover/popular" />,
  },
  ...movieRoutes,
  ...tvRoutes,
  {
    path: 'movie/detail/:id',
    element: <Movie />,
  },
  {
    path: 'tv/detail/:id',
    element: <Tv />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

/** Root router component. */
export const Router: FC = () => useRoutes(routes);
