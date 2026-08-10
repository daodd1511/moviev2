import { lazy } from 'react';
import { Navigate, RouteObject } from 'react-router-dom';

export const TVs = lazy(() =>
  import('./pages/TVsPage').then(module => ({
    default: module.TVsPage,
  })),
);

export const TvByDiscover = lazy(() =>
  import('./components').then(module => ({
    default: module.TvByDiscover,
  })),
);

export const DetailPage = lazy(() =>
  import('./pages/DetailPage').then(module => ({
    default: module.DetailPage,
  })),
);

export const SeasonDetailPage = lazy(() =>
  import('./pages/SeasonDetailPage').then(module => ({
    default: module.SeasonDetailPage,
  })),
);

export const SeriesQualityPage = lazy(() =>
  import('./pages/SeriesQualityPage').then(module => ({
    default: module.SeriesQualityPage,
  })),
);

export const tvRoutes: RouteObject[] = [
  {
    path: 'tv',
    children: [
      {
        path: 'discover/:discover',
        element: <TVs />,
      },
      {
        path: ':id/season/:seasonNumber',
        element: <SeasonDetailPage />,
      },
      {
        path: ':id/quality',
        element: <SeriesQualityPage />,
      },
      {
        path: ':id',
        element: <DetailPage />,
      },
      {
        path: '',
        element: <Navigate to="discover/popular" />,
      },
    ],
  },
];
