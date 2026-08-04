import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
const SearchPage = lazy(() =>
  import('./pages/SearchPage').then(module => ({ default: module.SearchPage })),
);
export const searchRoutes: RouteObject[] = [{ path: 'search', element: <SearchPage /> }];
