import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

export const Movies = lazy(() =>
  import('./Movies').then(module => ({
    default: module.Movies,
  })));

export const Main = lazy(() =>
  import('./components/Main').then(module => ({
    default: module.Main,
  })));

export const movieRoutes: RouteObject[] = [
  {
    path: 'movie',
    element: <Movies />,
    children: [
      {
        path: '',
        element: <Navigate to="popular" />,
      },
      {
        path: ':discover',
        element: <Main />,
      },
    ],
  },
];
