import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

export const TVs = lazy(() =>
  import('./pages/TVsPage').then(module => ({
    default: module.TVsPage,
  })));

export const TvByDiscover = lazy(() =>
  import('./components').then(module => ({
    default: module.TvByDiscover,
  })));

export const TvByGenre = lazy(() =>
  import('./components').then(module => ({
    default: module.TvByGenre,
  })));

export const DetailPage = lazy(() =>
  import('./pages/DetailPage').then(module => ({
    default: module.DetailPage,
  })));

export const tvRoutes: RouteObject[] = [
  {
    path: 'tv',
    element: <TVs />,
    children: [
      {
        path: 'discover/:discover',
        element: <TvByDiscover />,
      },
      {
        path: '',
        element: <Navigate to="/popular" />,
      },
      {
        path: 'detail/:id',
        element: <DetailPage />,
      },
    ],
  },

  // {
  //   path: 'genre/:genreId',
  //   element: <TvByGenre />,
  // },
];
