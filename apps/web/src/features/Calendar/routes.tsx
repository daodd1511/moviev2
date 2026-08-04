import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';
const CalendarPage = lazy(() =>
  import('./pages/CalendarPage').then(module => ({ default: module.CalendarPage })),
);
export const calendarRoutes: RouteObject[] = [{ path: 'user/calendar', element: <CalendarPage /> }];
