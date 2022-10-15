import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

export const Movies = lazy(() =>
  import('./Movies').then(module => ({
    default: module.Movies,
  })));

export const MovieByDiscover = lazy(() =>
  import('./components').then(module => ({
    default: module.MovieByDiscover,
  })));

export const MovieByGenre = lazy(() =>
  import('./components').then(module => ({
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
        path: ':discover',
        element: <MovieByDiscover />,
      },
      {
        path: '',
        element: <Navigate to="popular" />,
      },
    ],
  },
];
