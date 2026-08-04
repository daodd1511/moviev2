import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

export const PublicProfilePage = lazy(() =>
  import('./pages/PublicProfilePage').then(module => ({ default: module.PublicProfilePage })),
);

export const profileRoutes: RouteObject[] = [
  { path: 'u/:username', element: <PublicProfilePage /> },
];
