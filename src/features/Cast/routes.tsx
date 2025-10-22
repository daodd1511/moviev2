import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

export const CastPage = lazy(() =>
  import('./pages/CastPage').then(module => ({
    default: module.CastPage,
  })));

export const castRoutes: RouteObject[] = [
  {
    path: ':mediaType/:id/cast',
    element: <CastPage />,
  },
];
