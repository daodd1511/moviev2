import { lazy } from 'react';
import { Navigate, type RouteObject, useParams } from 'react-router-dom';

const NewCollectionPage = lazy(() => import('./pages/NewCollectionPage').then(module => ({ default: module.NewCollectionPage })));
const CollectionPage = lazy(() => import('./pages/CollectionPage').then(module => ({ default: module.CollectionPage })));

const LegacyCollectionRedirect = () => {
  const { id = '' } = useParams<{ id: string }>();
  return <Navigate replace to={`/collections/${id}`} />;
};

export const collectionRoutes: RouteObject[] = [
  { path: 'collections/new', element: <NewCollectionPage /> },
  { path: 'collections/:id', element: <CollectionPage /> },
  { path: 'list/new', element: <Navigate replace to="/collections/new" /> },
  { path: 'list/:id', element: <LegacyCollectionRedirect /> },
];
