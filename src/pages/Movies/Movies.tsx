import { memo } from 'react';
import { Outlet } from 'react-router-dom';

import { Type } from '../../core/enums';

import { Sidebar } from './components';

const MoviesComponent = () => (
  <div className="flex">
    <div className="w-60 min-h-screen">
      <Sidebar
        type={Type.Movie}
      />
    </div>
    <div className="divider divider-horizontal m-0 w-0" />
    <div className="grow">
      <Outlet />
    </div>
  </div>
);

export const Movies = memo(MoviesComponent);
