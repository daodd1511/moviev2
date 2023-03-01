import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

export const WatchPage = lazy(() =>
  import('./pages/Watch').then(module => ({
    default: module.WatchPage,
  })));

export const watchRoutes: RouteObject[] = [
  {
    path: 'watch',
    element: <Navigate to="/" />,
  },
  {
    path: 'watch/:id',
    element: <WatchPage />,
  },

];
