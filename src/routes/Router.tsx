import { FC } from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';

import { Movies } from '../pages/Movies';

const routes: RouteObject[] = [
  {
    path: '',
    element: <Movies />,
  },
];

/** Root router component. */
export const Router: FC = () => useRoutes(routes);
