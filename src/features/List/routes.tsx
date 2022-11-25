import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

export const NewPage = lazy(() =>
  import('./pages/NewPage').then(module => ({
    default: module.NewPage,
  })));

export const DetailPage = lazy(() =>
  import('./pages/Detail').then(module => ({
    default: module.Detail,
  })));

export const listRoutes: RouteObject[] = [
  {
    path: 'list',
    children: [
      {
        path: 'new',
        element: <NewPage />,
      },
      {
        path: ':id',
        element: <DetailPage />,
      },
    ],
  },
];
