import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Star, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { getApiErrorMessage } from '@/api/utils/getApiErrorMessage';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  LibraryEntry,
  LibraryEntrySort,
  LibraryTvProgress,
  LibraryWatchState,
} from '@/models/library-entry.model';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';
import { formatMediumDate } from '@/shared/utils/formatDate';
import { LibraryEntryQueries } from '@/stores/queries/libraryEntryQueries';

import { LibraryEntryEditor } from './LibraryEntryEditor';

interface Props {
  readonly entry: LibraryEntry;
  /** Field the listing is ordered by; surfaced on the card so the order is legible. */
  readonly sort?: LibraryEntrySort;
}

/** Entry fields holding a date the card can display. */
type DateField = 'startedAt' | 'completedAt' | 'lastWatchedAt' | 'updatedAt' | 'createdAt';

interface DateFact {
  readonly field: DateField;
  readonly label: string;
}

const labels = {
  planned: 'Watchlist',
  watching: 'Watching',
  completed: 'Completed',
  paused: 'Paused',
  dropped: 'Dropped',
} as const;

/** The one date worth showing for each watch state — `null` when none is meaningful. */
const primaryDateByState: Record<LibraryWatchState, DateFact | null> = {
  planned: null,
  watching: { field: 'startedAt', label: 'Watching since' },
  completed: { field: 'completedAt', label: 'Finished' },
  paused: { field: 'lastWatchedAt', label: 'Last watched' },
  dropped: { field: 'lastWatchedAt', label: 'Last watched' },
};

const sortDates: Record<LibraryEntrySort, DateFact> = {
  updatedAt: { field: 'updatedAt', label: 'Updated' },
  createdAt: { field: 'createdAt', label: 'Added' },
  lastWatchedAt: { field: 'lastWatchedAt', label: 'Last watched' },
};

/** Renders a date fact as `Finished Aug 3, 2026`, or `null` when the entry has no such date. */
const formatDateFact = (entry: LibraryEntry, fact: DateFact): string | null => {
  const value = entry[fact.field];
  return value === null ? null : `${fact.label} ${formatMediumDate(value)}`;
};

/** Renders TV position and episode count as separate facts, e.g. `S2E7` and `14 episodes watched`. */
const formatTvProgress = (progress: LibraryTvProgress | null): readonly string[] => {
  if (progress === null) return [];
  const position = `S${progress.season}E${progress.episode}`;
  return progress.watchedEpisodeCount === null
    ? [position]
    : [position, `${progress.watchedEpisodeCount} episodes watched`];
};

/** Builds the dot-separated facts in the card footer, skipping anything the entry has no value for. */
const buildMetaFacts = (entry: LibraryEntry, sort: LibraryEntrySort): readonly string[] => {
  const primary = primaryDateByState[entry.watchState];
  const sortDate = sortDates[sort];
  const primaryText = primary === null ? null : formatDateFact(entry, primary);
  const sortText =
    primary !== null && primary.field === sortDate.field ? null : formatDateFact(entry, sortDate);

  return [
    entry.mediaType === 'tv' ? 'TV show' : 'Movie',
    ...formatTvProgress(entry.tvProgress),
    primaryText,
    sortText,
  ].filter((fact): fact is string => fact !== null);
};

export const LibraryEntryCard = ({ entry, sort = 'updatedAt' }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const remove = LibraryEntryQueries.useRemove();
  const { mediaSnapshot } = entry;
  const detailPath = `/${entry.mediaType}/${entry.tmdbId}`;
  const imageUrl =
    mediaSnapshot.posterPath === null
      ? '/images/no-image.png'
      : `${IMAGE_BASE_URL}${PosterSizes.large}${mediaSnapshot.posterPath}`;
  const metaFacts = buildMetaFacts(entry, sort);

  const handleSaved = () => {
    setIsEditing(false);
    toast.success(`Saved “${mediaSnapshot.title}”.`);
  };

  const handleCancel = () => setIsEditing(false);

  const handleRemove = () => {
    remove.mutate(
      { mediaType: entry.mediaType, tmdbId: entry.tmdbId },
      {
        onSuccess: () => {
          setIsRemoving(false);
          toast.success(`Removed “${mediaSnapshot.title}” from your Library.`);
        },
        onError: error =>
          toast.error(getApiErrorMessage(error, 'Could not remove this Library entry.')),
      },
    );
  };

  return (
    <article className="group relative isolate flex h-full min-h-44 overflow-hidden rounded-xl border border-foreground/10 bg-surface/50 transition-colors duration-200 hover:border-foreground/25">
      {/* Atmosphere: the poster itself, blurred behind a ground scrim, so each card carries its own light. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <img
          src={imageUrl}
          alt=""
          className="size-full scale-125 object-cover opacity-30 blur-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/90 to-background/75" />
      </div>

      <Link
        to={detailPath}
        tabIndex={-1}
        aria-hidden="true"
        className="relative w-24 shrink-0 self-stretch overflow-hidden sm:w-28"
      >
        <img
          src={imageUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 size-full object-cover transition-transform duration-300 ease-[cubic-bezier(.2,.9,.3,1)] motion-safe:group-hover:scale-105"
        />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-background/60" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-foreground/20 px-2.5 py-0.5 text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {labels[entry.watchState]}
          </span>
          {entry.rating !== null && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              <Star className="size-3 fill-current" aria-hidden="true" />
              {entry.rating}/10
            </span>
          )}
        </div>

        <h2 className="truncate text-xl leading-tight font-medium tracking-tight">
          <Link to={detailPath} className="transition-colors hover:text-primary">
            {mediaSnapshot.title}
          </Link>
        </h2>

        {entry.notes !== null && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {entry.notes}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            {metaFacts.map((fact, index) => (
              <span key={fact} className="inline-flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">·</span>}
                {fact}
              </span>
            ))}
          </p>
          <div className="flex shrink-0 items-center gap-1 transition-opacity duration-200 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Edit ${mediaSnapshot.title}`}
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent
                aria-describedby={undefined}
                className="max-h-[85vh] overflow-y-auto sm:max-w-2xl"
              >
                <DialogHeader>
                  <DialogTitle className="text-xl leading-tight">
                    Edit {mediaSnapshot.title}
                  </DialogTitle>
                </DialogHeader>
                <LibraryEntryEditor entry={entry} onSaved={handleSaved} onCancel={handleCancel} />
              </DialogContent>
            </Dialog>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Remove ${mediaSnapshot.title}`}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              disabled={remove.isPending}
              onClick={() => setIsRemoving(true)}
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isRemoving}
        onOpenChange={setIsRemoving}
        icon={<Trash2 aria-hidden="true" className="size-5" />}
        title={`Remove “${mediaSnapshot.title}”?`}
        description="This deletes the entry with its rating, dates, progress, and notes. This action cannot be undone."
        confirmLabel="Remove entry"
        destructive
        isLoading={remove.isPending}
        onConfirm={handleRemove}
      />
    </article>
  );
};
