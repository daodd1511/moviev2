import { Outlet } from 'react-router-dom';

import { Navbar } from './Navbar';

export const WithNavbar = () => (
  <>
    <Navbar />
    <div className="m-auto max-w-screen-2xl pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
      <Outlet />
    </div>
  </>
);
