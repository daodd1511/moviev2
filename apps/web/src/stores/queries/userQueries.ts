import { useQuery } from '@tanstack/react-query';

import { backendApi } from '@/api';

interface UserProfile {
  readonly username: string;
}

export namespace UserQueries {
  export const useProfile = () =>
    useQuery<UserProfile>({
      queryKey: ['user'],
      queryFn: () => backendApi.get<UserProfile>('/user/profile').then(res => res.data),
    });
}
