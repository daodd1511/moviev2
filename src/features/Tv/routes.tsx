import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

export const TVs = lazy(() =>
  import('../pages/TVs').then(module => ({
    default: module.TVs,
  })));

export const TvByDiscover = lazy(() =>
  import('../pages/TVs/components').then(module => ({
    default: module.TvByDiscover,
  })));

export const TvByGenre = lazy(() =>
  import('../pages/TVs/components').then(module => ({
    default: module.TvByGenre,
  })));

export const tvRoutes: RouteObject[] = [
  {
    path: 'tv',
    element: <TVs />,
    children: [
      {
        path: 'genre/:genreId',
        element: <TvByGenre />,
      },
      {
        path: 'discover/:discover',
        element: <TvByDiscover />,
      },
      {
        path: '',
        element: <Navigate to="discover/popular" />,
      },
    ],
  },
];
