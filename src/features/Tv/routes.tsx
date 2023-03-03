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
    children: [
      {
        path: 'discover/:discover',
        element: <TVs />,
      },
      {
        path: 'genre/:genreId',
        element: <TvByGenre />,
      },
      {
        path: 'detail/:id',
        element: <DetailPage />,
      },
      {
        path: '',
        element: <Navigate to="discover/popular" />,
      },
    ],
  },

];
