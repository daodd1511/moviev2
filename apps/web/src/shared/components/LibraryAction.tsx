import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAtom } from 'jotai';
import { BookmarkCheck, BookmarkPlus, LoaderCircle } from 'lucide-react';

import { LibraryEntryMapper } from '@/api/mappers/library-entry.mapper';
import { Button } from '@/components/ui/button';
import { Media } from '@/models';
import { LibraryEntryQueries } from '@/stores/queries/libraryEntryQueries';
import { isAuthAtom } from '@/stores/atoms/authAtoms';

interface Props {
  /** Movie or TV title to add to or remove from the private Library. */
  readonly media: Media;

  /** Additional trigger styles from the surrounding surface. */
  readonly className?: string;

  /** Hides the text label while retaining the accessible action name. */
  readonly iconOnly?: boolean;
}

const getRedirectPath = (pathname: string, search: string): string => `${pathname}${search}`;

const AuthenticatedLibraryAction = ({ media, className, iconOnly = false }: Props) => {
  const [announcement, setAnnouncement] = useState('');
  const { data: entries = [], isPending } = LibraryEntryQueries.useList({});
  const upsert = LibraryEntryQueries.useUpsert();
  const remove = LibraryEntryQueries.useRemove();
  const entry = entries.find(candidate => candidate.mediaType === media.type && candidate.tmdbId === media.id);
  const isMutating = upsert.isPending || remove.isPending;
  const isTracked = entry !== undefined;
  const label = isTracked ? 'Remove from Library' : 'Add to Library';

  const handleClick = () => {
    if (isTracked) {
      remove.mutate(
        { mediaType: entry.mediaType, tmdbId: entry.tmdbId },
        {
          onSuccess: () => setAnnouncement(`${media.title} removed from your Library.`),
          onError: () => setAnnouncement(`Could not remove ${media.title} from your Library.`),
        },
      );
      return;
    }

    upsert.mutate(LibraryEntryMapper.toInput(media), {
      onSuccess: () => setAnnouncement(`${media.title} added to your Library.`),
      onError: () => setAnnouncement(`Could not add ${media.title} to your Library.`),
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size={iconOnly ? 'icon' : 'default'}
        className={className}
        aria-label={label}
        disabled={isPending || isMutating}
        onClick={handleClick}
      >
        {isMutating ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
        ) : isTracked ? (
          <BookmarkCheck aria-hidden="true" className="size-4" />
        ) : (
          <BookmarkPlus aria-hidden="true" className="size-4" />
        )}
        {!iconOnly && <span>{isTracked ? 'In Library' : 'Add to Library'}</span>}
      </Button>
      <p className="sr-only" aria-live="polite" role="status">
        {announcement}
      </p>
    </>
  );
};

export const LibraryAction = ({ media, className, iconOnly = false }: Props) => {
  const [isAuthenticated] = useAtom(isAuthAtom);
  const { pathname, search } = useLocation();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(getRedirectPath(pathname, search));
    return (
      <Button asChild variant="secondary" size={iconOnly ? 'icon' : 'default'} className={className}>
        <Link to={`/auth/login?redirect=${redirect}`} aria-label="Log in to add to Library">
          <BookmarkPlus aria-hidden="true" className="size-4" />
          {!iconOnly && <span>Add to Library</span>}
        </Link>
      </Button>
    );
  }

  return <AuthenticatedLibraryAction media={media} className={className} iconOnly={iconOnly} />;
};
