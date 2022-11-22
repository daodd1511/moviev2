import { useQuery } from '@tanstack/react-query';

import { API_CONFIG } from '@/api/config';
import { TokenService } from '@/api/services/tokenService';

export namespace UserQueries {
  export const useProfile = () => {
    const token = TokenService.get();
    return useQuery(['user', token], () => fetch(`${API_CONFIG.backendUrl}user/profile?token=${token}`).then(res => res.json()));
  };
}
