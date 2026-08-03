import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAtom } from 'jotai';
import { LoaderCircle, UserCheck, UserPlus, Users as UsersIcon } from 'lucide-react';

import { Loader } from '@/shared/components';
import { NotFound } from '@/shared/components/NotFound';
import { Button } from '@/components/ui/button';
import { SocialQueries } from '@/stores/queries/socialQueries';
import { UserQueries } from '@/stores/queries/userQueries';
import { isAuthAtom } from '@/stores/atoms/authAtoms';

type FollowListKind = 'followers' | 'following';

const getRedirectPath = (pathname: string, search: string) => `${pathname}${search}`;

interface FollowListProps {
  readonly username: string;
  readonly kind: FollowListKind;
}

const FollowList = ({ username, kind }: FollowListProps) => {
  const { data = [], isPending } =
    kind === 'followers'
      ? SocialQueries.useFollowers(username, true)
      : SocialQueries.useFollowing(username, true);

  if (isPending) return <Loader className="min-h-24" />;
  if (data.length === 0)
    return <p className="mt-3 text-sm text-muted-foreground">No {kind} to show.</p>;
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {data.map(name => (
        <li key={name}>
          <Link to={`/u/${name}`} className="text-sm text-primary hover:underline">
            @{name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const FollowButton = ({ username }: { readonly username: string }) => {
  const [isAuthenticated] = useAtom(isAuthAtom);
  const { pathname, search } = useLocation();
  const { data: viewer } = UserQueries.useProfile(isAuthenticated);
  const { data: profile } = SocialQueries.useProfile(username);
  const follow = SocialQueries.useFollow();
  const unfollow = SocialQueries.useUnfollow();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(getRedirectPath(pathname, search));
    return (
      <Button asChild variant="secondary">
        <Link to={`/auth/login?redirect=${redirect}`} aria-label={`Log in to follow @${username}`}>
          <UserPlus aria-hidden="true" className="size-4" />
          <span>Follow</span>
        </Link>
      </Button>
    );
  }

  if (profile === undefined || viewer?.username === username) return null;

  const isPending = follow.isPending || unfollow.isPending;
  const handleClick = () => {
    if (profile.isFollowedByViewer) unfollow.mutate(username);
    else follow.mutate(username);
  };

  return (
    <>
      <Button
        type="button"
        variant={profile.isFollowedByViewer ? 'outline' : 'default'}
        onClick={handleClick}
        disabled={isPending}
        aria-pressed={profile.isFollowedByViewer}
      >
        {isPending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : profile.isFollowedByViewer ? (
          <UserCheck aria-hidden="true" className="size-4" />
        ) : (
          <UserPlus aria-hidden="true" className="size-4" />
        )}
        <span>{profile.isFollowedByViewer ? 'Following' : 'Follow'}</span>
      </Button>
      <p className="sr-only" aria-live="polite" role="status">
        {isPending ? 'Updating…' : profile.isFollowedByViewer ? `Following @${username}` : ''}
      </p>
    </>
  );
};

export const PublicProfilePage = () => {
  const { username = '' } = useParams<{ username: string }>();
  const { data: profile, isPending, isError } = SocialQueries.useProfile(username);
  const [expanded, setExpanded] = useState<FollowListKind | null>(null);

  if (isPending) return <Loader className="min-h-[60vh]" />;
  if (isError || profile === undefined) return <NotFound />;

  const displayName =
    [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username;
  const toggleExpanded = (kind: FollowListKind) =>
    setExpanded(current => (current === kind ? null : kind));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <UsersIcon aria-hidden="true" className="size-6 text-primary" />
          <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{displayName}</h1>
          <p className="text-muted-foreground">@{profile.username}</p>
        </div>
        <FollowButton username={profile.username} />
      </div>

      <div className="mt-8 flex gap-6 border-y border-border py-4">
        <button
          type="button"
          className="text-left"
          onClick={() => toggleExpanded('followers')}
          aria-expanded={expanded === 'followers'}
          aria-label={`${profile.followerCount} Followers`}
        >
          <span className="block text-lg font-semibold" aria-hidden="true">
            {profile.followerCount}
          </span>
          <span className="text-sm text-muted-foreground" aria-hidden="true">
            Followers
          </span>
        </button>
        <button
          type="button"
          className="text-left"
          onClick={() => toggleExpanded('following')}
          aria-expanded={expanded === 'following'}
          aria-label={`${profile.followingCount} Following`}
        >
          <span className="block text-lg font-semibold" aria-hidden="true">
            {profile.followingCount}
          </span>
          <span className="text-sm text-muted-foreground" aria-hidden="true">
            Following
          </span>
        </button>
      </div>

      {expanded !== null && <FollowList username={profile.username} kind={expanded} />}
    </main>
  );
};
