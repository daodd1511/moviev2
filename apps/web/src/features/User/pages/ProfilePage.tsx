import { useState } from 'react';
import { LogOut } from 'lucide-react';

import { Loader } from '@/shared/components';
import { UserQueries } from '@/stores/queries/userQueries';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useLogout } from '@/shared/hooks';

export const ProfilePage = () => {
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);
  const { isLoggingOut, logout } = useLogout();
  const { data, isLoading } = UserQueries.useProfile();

  if (isLoading) {
    return <Loader className="min-h-[60vh]"/>;
  }
  return (
    <div className="px-4 py-8 md:px-8 md:py-12">
      <h1 className="text-2xl font-semibold md:text-3xl">Profile</h1>
      <p className="mt-2 text-muted-foreground">
        Hello <span className="text-foreground">{data?.username}</span>
      </p>

      <div className="mt-8 border-t border-border pt-6">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full justify-start gap-3 border-destructive/30 px-4 text-destructive hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive sm:w-auto"
          onClick={() => setIsConfirmLogoutOpen(true)}
        >
          <LogOut aria-hidden="true" />
          Sign out
        </Button>
      </div>

      <ConfirmDialog
        open={isConfirmLogoutOpen}
        onOpenChange={setIsConfirmLogoutOpen}
        icon={<LogOut aria-hidden="true" className="size-5" />}
        title="Sign out of Flix?"
        description="You will need to sign in again to manage your lists and account."
        confirmLabel="Sign out"
        isLoading={isLoggingOut}
        onConfirm={logout}
      />
    </div>
  );
};
