import { Loader } from '@/shared/components';
import { UserQueries } from '@/stores/queries/userQueries';

export const ProfilePage = () => {
  const { data, isLoading } = UserQueries.useProfile();

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
