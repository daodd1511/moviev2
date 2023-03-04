import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

export const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then(module => ({
    default: module.ProfilePage,
  })));

// export const ListPage = lazy(() =>
//   import('./pages/ListPage').then(module => ({
//     default: module.ListPage,
//   })));

export const userRoutes: RouteObject[] = [
  {
    path: 'user',
    children: [
      {
        path: 'profile',
        element: <ProfilePage />,
      },

      // {
      //   path: 'lists',
      //   element: <ListPage />,
      // },
    ],
  },
];
