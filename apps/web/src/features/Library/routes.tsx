import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

export const LibraryPage = lazy(() =>
  import('./pages/LibraryPage').then(module => ({ default: module.LibraryPage })),
);

export const libraryRoutes: RouteObject[] = [
  { path: 'user/library', element: <LibraryPage /> },
  { path: 'user/watchlist', element: <Navigate to="/user/library?state=planned" replace /> },
];
