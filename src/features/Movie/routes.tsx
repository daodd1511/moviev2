import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

export const Movies = lazy(() =>
  import('./pages/MoviesPage').then(module => ({
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

export const DetailPage = lazy(() =>
  import('./pages/DetailPage').then(module => ({
    default: module.DetailPage,
  })));

export const movieRoutes: RouteObject[] = [
  {
    path: 'movie',
    children: [
      {
        path: 'genre/:genreId',
        element: <MovieByGenre />,
      },
      {
        path: 'discover/:discover',
        element: <Movies />,
      },
      {
        path: 'detail/:id',
        element: <DetailPage />,
      },
      {
        path: '',
        element: <Navigate to="/popular" />,
      },
    ],
  },

];
