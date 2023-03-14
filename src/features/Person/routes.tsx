import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

export const PersonPage = lazy(() =>
  import('./pages/Person').then(module => ({
    default: module.PersonPage,
  })));

export const personRoutes: RouteObject[] = [
  {
    path: 'person',
    children: [
      {
        path: ':id',
        element: <PersonPage />,
      },
    ],
  },
];
