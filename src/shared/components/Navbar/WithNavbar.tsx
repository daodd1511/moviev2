import { Outlet } from 'react-router-dom';

import { Navbar } from './Navbar';

export const WithNavbar = () => (
  <>
    <Navbar />
    <div className="m-auto max-w-screen-2xl">
      <Outlet/>
    </div>
  </>
);
