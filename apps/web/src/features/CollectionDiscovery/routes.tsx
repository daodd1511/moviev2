import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

export const CollectionDiscoveryPage = lazy(() =>
  import('./pages/CollectionDiscoveryPage').then(module => ({
    default: module.CollectionDiscoveryPage,
  })),
);

export const collectionDiscoveryRoutes: RouteObject[] = [
  { path: 'collections/discover', element: <CollectionDiscoveryPage /> },
];
