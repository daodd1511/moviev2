import { Loader } from '@/shared/components';
import { UserQueries } from '@/stores/queries/userQueries';

export const ProfilePage = () => {
  const { data, isLoading } = UserQueries.useProfile();

  if (isLoading) {
    return <Loader className="h-withoutNavbar"/>;
  }
  return (
    <div className="px-8 py-12">
      <h1>Profile page</h1>
      <p className="mt-2 text-muted-foreground">
        Hello <span className="text-foreground">{data?.username}</span>
      </p>
    </div>
  );
};
