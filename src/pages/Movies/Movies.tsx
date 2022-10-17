import { memo } from 'react';
import { Outlet } from 'react-router-dom';

import { Type } from '../../core/enums';

import { Sidebar } from './components';

const MoviesComponent = () => (
  <div className="flex">
    <div className="overflow-y-auto overflow-x-hidden h-screen sticky top-0">
      <Sidebar
        type={Type.Movie}
      />
    </div>
    <div className="py-2 w-[1px] bg-slate-300" />
    <div className="grow">
      <Outlet />
    </div>
  </div>
);

export const Movies = memo(MoviesComponent);
