import { useAtom } from 'jotai';

import { useQuery } from '@tanstack/react-query';

import { userIdAtom } from '@/stores/userStore';
import { API_CONFIG } from '@/api/config';
import { Loader } from '@/shared/components';
import { isAuthAtom } from '@/stores/authStore';
import { TokenService } from '@/api/services/tokenService';

export const ProfilePage = () => {
  const [userId] = useAtom(userIdAtom);
  const token = TokenService.get();
  const { data, isLoading } = useQuery(['user', userId], () => fetch(`${API_CONFIG.backendUrl}user/${userId ?? ''}?token=${token}`).then(res => res.json()), {
    enabled: !(userId === null),
  });

// const { user, logout } = useAuth();
// const { data, isLoading, isError, error } = useGetUserDetailsQuery(user?.id);
// const { data: watchlistData } = useGetWatchlistQuery(user?.id);
// const { data: favoriteData } = useGetFavoriteQuery(user?.id);
// const { data: ratedData } = useGetRatedQuery(user?.id);
// const { data: recommendationsData } = useGetRecommendationsQuery(user?.id);
// const { data: watchlistRecommendationsData } = useGetWatchlistRecommendationsQuery(user?.id);
// const { data: favoriteRecommendationsData } = useGetFavoriteRecommendationsQuery(user?.id);
// const { data: ratedRecommendationsData } = useGetRatedRecommendationsQuery(user?.id);

  if (isLoading) {
    return <Loader />;
  }
  return (
    <div>
      <h1>Profile page</h1>
      <div>{JSON.stringify(data, null, 2)}</div>
    </div>
  );
};
