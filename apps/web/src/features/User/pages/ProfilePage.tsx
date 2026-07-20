import { Loader } from '@/shared/components';
import { UserQueries } from '@/stores/queries/userQueries';

export const ProfilePage = () => {
  const { data, isLoading } = UserQueries.useProfile();

  if (isLoading) {
    return <Loader className="h-withoutNavbar"/>;
  }
  return (
    <div>
      <h1>Profile page</h1>
      Hello <span>{data?.username}</span>
    </div>
  );
};
