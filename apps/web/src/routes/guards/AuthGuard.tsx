import { useAtom } from 'jotai';
import { To, Navigate, Outlet, useLocation } from 'react-router-dom';

import { isAuthAtom } from '@/stores/atoms/authAtoms';

export const AuthGuard = () => {
  const [isAuth] = useAtom(isAuthAtom);
  const location = useLocation();
  if (!isAuth) {
    const redirectPath = `${location.pathname}${location.search}`;
    const redirect: To = {
      pathname: '/auth/login',
      search: `?${new URLSearchParams({ redirect: redirectPath }).toString()}`,
    };
    return <Navigate to={redirect} replace />;
  }
  return <Outlet />;
};
