import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useState } from 'react';

import { AuthService } from '@/api/services/authService';
import { Login } from '@/models/auth/login.model';
import { API_CONFIG } from '@/api/config';

export const LoginPage = () => {
  const queryClient = useQueryClient();
  const [accessToken, setAccessToken] = useState('');
  const [userId, setUserId] = useState('');
  const mutation = useMutation({
    mutationFn: ({ username, password }: Login) => AuthService.login(username, password),
    onSuccess(data) {
      setAccessToken(data.accessToken);
      setUserId(data.id);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      queryClient.invalidateQueries({ queryKey: ['testApi'] });
    },
  });
  const { data, isLoading } = useQuery(['testApi', { userId, accessToken }], () => fetch(`${API_CONFIG.backendUrl}/user/${userId}/?token=${accessToken}`).then(res => res.json()));
    return (
      <div>
        {isLoading && <div>Loading...</div>}
        <div>{JSON.stringify(data)}</div>
        <button onClick={() => mutation.mutate({ username: '123', password: '123456' })}>Login</button>
      </div>
    );
};
