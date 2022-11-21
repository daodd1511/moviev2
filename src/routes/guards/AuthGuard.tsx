import { useAtom } from 'jotai';
import { To, Navigate, Outlet } from 'react-router-dom';

import { isAuthAtom } from '@/stores/authStore';

export const AuthGuard = () => {
    const [isAuth] = useAtom(isAuthAtom);
    if (!isAuth) {
      const redirect: To = {
        pathname: 'auth/login',
      };
      return <Navigate to={redirect} replace/>;
    }
    return <Outlet />;
  };
