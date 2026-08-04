import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

export const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then(module => ({
    default: module.ProfilePage,
  })),
);
export const CollectionListPage = lazy(() =>
  import('../Collection/pages/CollectionListPage').then(module => ({
    default: module.CollectionListPage,
  })),
);

export const userRoutes: RouteObject[] = [
  {
    path: 'user',
    children: [
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'lists',
        element: <Navigate replace to="/user/collections" />,
      },
      {
        path: 'collections',
        element: <CollectionListPage />,
      },
    ],
  },
];
