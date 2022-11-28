import { useQuery } from '@tanstack/react-query';

import { backendApi } from '@/api';

export namespace UserQueries {
  export const useProfile = () => useQuery(['user'], () => backendApi.get('/user/profile').then(res => res.data));
}
