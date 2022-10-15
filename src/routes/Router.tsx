/* eslint-disable @typescript-eslint/promise-function-async */
import { FC, lazy } from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';

export const Movies = lazy(() =>
  import('../pages/Movies').then(module => ({
    default: module.Movies,
  })));

export const Movie = lazy(() =>
  import('../pages/Movie').then(module => ({
    default: module.Movie,
  })));

export const NotFound = lazy(() =>
  import('../pages/NotFound').then(module => ({
    default: module.NotFound,
  })));

const routes: RouteObject[] = [
  {
    path: '',
    element: <Movies />,
  },
  {
    path: 'movie/:id',
    element: <Movie />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

/** Root router component. */
export const Router: FC = () => useRoutes(routes);
