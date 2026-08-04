import { ChangeEvent, useState } from 'react';
import { LogOut } from 'lucide-react';

import { Loader } from '@/shared/components';
import { UpdateSocialSettingsInput, UserQueries } from '@/stores/queries/userQueries';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useLogout } from '@/shared/hooks';

const SocialSettings = () => {
  const { data, isPending } = UserQueries.useProfile();
  const updateSettings = UserQueries.useUpdateSocialSettings();

  if (isPending || data === undefined) return null;

  const handleToggle =
    (key: keyof UpdateSocialSettingsInput) => (event: ChangeEvent<HTMLInputElement>) => {
      updateSettings.mutate({ [key]: event.target.checked });
    };

  return (
    <div className="mt-8 border-t border-border pt-6">
      <h2 className="text-lg font-medium">Public profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Control what other Flix users can see about you.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={data.social.publicProfile}
            onChange={handleToggle('publicProfile')}
            disabled={updateSettings.isPending}
            className="size-4"
          />
          Make my profile public
        </label>
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={data.social.showFollowers}
            onChange={handleToggle('showFollowers')}
            disabled={updateSettings.isPending || !data.social.publicProfile}
            className="size-4"
          />
          Show my followers list
        </label>
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={data.social.showFollowing}
            onChange={handleToggle('showFollowing')}
            disabled={updateSettings.isPending || !data.social.publicProfile}
            className="size-4"
          />
          Show who I follow
        </label>
      </div>
      <p className="sr-only" aria-live="polite" role="status">
        {updateSettings.isPending ? 'Saving…' : updateSettings.isSuccess ? 'Saved.' : ''}
      </p>
    </div>
  );
};

export const ProfilePage = () => {
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);
  const { isLoggingOut, logout } = useLogout();
  const { data, isPending } = UserQueries.useProfile();

  if (isPending) {
    return <Loader className="min-h-[60vh]" />;
  }
  return (
    <div className="px-4 py-8 md:px-8 md:py-12">
      <h1 className="text-2xl font-semibold md:text-3xl">Profile</h1>
      <p className="mt-2 text-muted-foreground">
        Hello <span className="text-foreground">{data?.username}</span>
      </p>

      <SocialSettings />

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
