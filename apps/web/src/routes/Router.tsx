import { FC, lazy } from 'react';
import { Navigate, RouteObject, useRoutes } from 'react-router-dom';

import { NoAuthGuard } from './guards/NoAuthGuard';
import { AuthGuard } from './guards/AuthGuard';

import { movieRoutes } from '@/features/Movie/routes';
import { tvRoutes } from '@/features/Tv/routes';
import { userRoutes } from '@/features/User/routes';
import { authRoutes } from '@/features/Auth/routes';
import { WithoutNavbar, WithNavbar } from '@/shared/components/Navbar/';
import { collectionRoutes } from '@/features/Collection/routes';
import { personRoutes } from '@/features/Person/routes';
import { castRoutes } from '@/features/Cast/routes';
import { libraryRoutes } from '@/features/Library/routes';
import { searchRoutes } from '@/features/Search/routes';

export const NotFound = lazy(() =>
  import('../shared/components/NotFound').then(module => ({
    default: module.NotFound,
  })),
);

export const PublicCollection = lazy(() =>
  import('../features/Collection/pages/PublicCollectionPage').then(module => ({
    default: module.PublicCollectionPage,
  })),
);

const routes: RouteObject[] = [
  {
    path: '',
    element: <Navigate to="/movie/discover/popular" />,
  },
  {
    element: <WithNavbar />,
    children: [
      ...movieRoutes,
      ...tvRoutes,
      ...personRoutes,
      ...castRoutes,
      ...searchRoutes,
      {
        path: '',
        element: <AuthGuard />,
        children: [...userRoutes, ...collectionRoutes, ...libraryRoutes],
      },
      {
        path: 'u/:username/collections/:collectionId',
        element: <PublicCollection />,
      },
      {
        path: 'u/:username/lists/:collectionId',
        element: <PublicCollection />,
      },
    ],
  },
  {
    path: 'auth',
    element: <WithoutNavbar />,
    children: [
      {
        element: <NoAuthGuard />,
        children: [...authRoutes],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

/** Root router component. */
export const Router: FC = () => useRoutes(routes);
