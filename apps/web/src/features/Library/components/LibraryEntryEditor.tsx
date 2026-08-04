import { FormEvent, useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { LibraryEntry, LibraryEntryInput, LibraryWatchState } from '@/models/library-entry.model';
import { LibraryEntryQueries } from '@/stores/queries/libraryEntryQueries';

interface Props {
  readonly entry: LibraryEntry;
}

const toDateInputValue = (value: string | null): string => value?.slice(0, 10) ?? '';
const toIsoDate = (value: string): string | null =>
  value === '' ? null : new Date(`${value}T00:00:00.000Z`).toISOString();

const isDateOrderValid = (startedAt: string | null, completedAt: string | null): boolean =>
  startedAt === null || completedAt === null || startedAt <= completedAt;

export const LibraryEntryEditor = ({ entry }: Props) => {
  const notesId = useId();
  const [watchState, setWatchState] = useState<LibraryWatchState>(entry.watchState);
  const [rating, setRating] = useState(entry.rating?.toString() ?? '');
  const [notes, setNotes] = useState(entry.notes ?? '');
  const [startedAt, setStartedAt] = useState(toDateInputValue(entry.startedAt));
  const [completedAt, setCompletedAt] = useState(toDateInputValue(entry.completedAt));
  const [lastWatchedAt, setLastWatchedAt] = useState(toDateInputValue(entry.lastWatchedAt));
  const [season, setSeason] = useState(entry.tvProgress?.season.toString() ?? '');
  const [episode, setEpisode] = useState(entry.tvProgress?.episode.toString() ?? '');
  const [watchedEpisodeCount, setWatchedEpisodeCount] = useState(
    entry.tvProgress?.watchedEpisodeCount?.toString() ?? '',
  );
  const [error, setError] = useState<string | null>(null);
  const upsert = LibraryEntryQueries.useUpsert();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedRating = rating === '' ? null : Number(rating);
    const start = toIsoDate(startedAt);
    const completed = toIsoDate(completedAt);
    const lastWatched = toIsoDate(lastWatchedAt);
    const hasProgress = season !== '' || episode !== '' || watchedEpisodeCount !== '';
    const parsedSeason = Number(season);
    const parsedEpisode = Number(episode);
    const parsedCount = watchedEpisodeCount === '' ? null : Number(watchedEpisodeCount);

    if (
      parsedRating !== null &&
      (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 10)
    ) {
      setError('Rating must be a whole number from 1 to 10.');
      return;
    }
    if (!isDateOrderValid(start, completed)) {
      setError('Completed date must be on or after the started date.');
      return;
    }
    if (
      hasProgress &&
      (entry.mediaType !== 'tv' ||
        !Number.isInteger(parsedSeason) ||
        parsedSeason < 1 ||
        !Number.isInteger(parsedEpisode) ||
        parsedEpisode < 1 ||
        (parsedCount !== null && (!Number.isInteger(parsedCount) || parsedCount < 1)))
    ) {
      setError('TV progress must use positive whole-number season and episode values.');
      return;
    }

    const input: LibraryEntryInput = {
      mediaType: entry.mediaType,
      tmdbId: entry.tmdbId,
      watchState,
      rating: parsedRating,
      notes: notes.trim() === '' ? null : notes.trim(),
      startedAt: start,
      completedAt: completed,
      lastWatchedAt: lastWatched,
      tvProgress: hasProgress
        ? { season: parsedSeason, episode: parsedEpisode, watchedEpisodeCount: parsedCount }
        : null,
      mediaSnapshot: entry.mediaSnapshot,
    };
    setError(null);
    upsert.mutate(input, { onError: () => setError('Could not save this Library entry.') });
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mt-4 grid gap-3 border-t border-border pt-4"
      aria-label={`Edit ${entry.mediaSnapshot.title}`}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          Status
          <select
            value={watchState}
            onChange={event => setWatchState(event.target.value as LibraryWatchState)}
            className="rounded-lg border border-input bg-transparent px-3 py-2"
          >
            <option value="planned">Watchlist</option>
            <option value="watching">Watching</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="dropped">Dropped</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Rating (1–10)
          <input
            type="number"
            min="1"
            max="10"
            step="1"
            value={rating}
            onChange={event => setRating(event.target.value)}
            className="rounded-lg border border-input bg-transparent px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Started
          <input
            type="date"
            value={startedAt}
            onChange={event => setStartedAt(event.target.value)}
            className="rounded-lg border border-input bg-transparent px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Completed
          <input
            type="date"
            value={completedAt}
            onChange={event => setCompletedAt(event.target.value)}
            className="rounded-lg border border-input bg-transparent px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Last watched
          <input
            type="date"
            value={lastWatchedAt}
            onChange={event => setLastWatchedAt(event.target.value)}
            className="rounded-lg border border-input bg-transparent px-3 py-2"
          />
        </label>
      </div>
      {entry.mediaType === 'tv' && (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="grid gap-1 text-sm">
            Season
            <input
              type="number"
              min="1"
              step="1"
              value={season}
              onChange={event => setSeason(event.target.value)}
              className="rounded-lg border border-input bg-transparent px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Episode
            <input
              type="number"
              min="1"
              step="1"
              value={episode}
              onChange={event => setEpisode(event.target.value)}
              className="rounded-lg border border-input bg-transparent px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Episodes watched
            <input
              type="number"
              min="1"
              step="1"
              value={watchedEpisodeCount}
              onChange={event => setWatchedEpisodeCount(event.target.value)}
              className="rounded-lg border border-input bg-transparent px-3 py-2"
            />
          </label>
        </div>
      )}
      <label htmlFor={notesId} className="grid gap-1 text-sm">
        Notes
        <textarea
          id={notesId}
          value={notes}
          onChange={event => setNotes(event.target.value)}
          className="min-h-20 rounded-lg border border-input bg-transparent px-3 py-2"
        />
      </label>
      {error !== null && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={upsert.isPending}>
          Save changes
        </Button>
        <p aria-live="polite" role="status" className="text-sm text-muted-foreground">
          {upsert.isSuccess ? 'Library entry saved.' : ''}
        </p>
      </div>
    </form>
  );
};
