import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

export const Movies = lazy(() =>
  import('../pages/Movies').then(module => ({
    default: module.Movies,
  })));

export const MovieByDiscover = lazy(() =>
  import('../pages/Movies/components').then(module => ({
    default: module.MovieByDiscover,
  })));

export const MovieByGenre = lazy(() =>
  import('../pages/Movies/components').then(module => ({
    default: module.MovieByGenre,
  })));

export const movieRoutes: RouteObject[] = [
  {
    path: 'movie',
    element: <Movies />,
    children: [
      {
        path: 'genre/:genreId',
        element: <MovieByGenre />,
      },
      {
        path: 'discover/:discover',
        element: <MovieByDiscover />,
      },
      {
        path: '',
        element: <Navigate to="discover/popular" />,
      },
    ],
  },
];
