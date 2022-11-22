import { Navigate, Outlet, To } from 'react-router-dom';
import { useAtom } from 'jotai';

import { isAuthAtom } from '@/stores/atoms/authAtoms';

export const NoAuthGuard = () => {
  const [isAuth] = useAtom(isAuthAtom);

  if (isAuth) {
    const redirect: To = {
      pathname: '/',
    };
    return <Navigate to={redirect} replace/>;
  }

  return <Outlet />;
};
