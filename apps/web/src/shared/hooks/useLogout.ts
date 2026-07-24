import { useState } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';

import { AuthService } from '@/api/services/authService';
import { isAuthAtom, tokenAtom } from '@/stores/atoms/authAtoms';
import { userIdAtom } from '@/stores/atoms/userAtoms';

export const useLogout = () => {
  const navigate = useNavigate();
  const [, setIsAuth] = useAtom(isAuthAtom);
  const [, setToken] = useAtom(tokenAtom);
  const [, setUserId] = useAtom(userIdAtom);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async() => {
    setIsLoggingOut(true);

    try {
      await AuthService.logout();
      setIsAuth(false);
      setToken(null);
      setUserId(null);
      navigate('/auth/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    isLoggingOut,
    logout,
  };
};
