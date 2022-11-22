import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

export const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then(module => ({
    default: module.ProfilePage,
  })));

export const userRoutes: RouteObject[] = [
  {
    path: 'profile',
    element: <ProfilePage />,
  },
];
