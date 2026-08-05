import { FormEvent, useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/shared/components/ui/DatePicker';
import { NumberField } from '@/shared/components/ui/NumberField';
import { LibraryEntry, LibraryEntryInput, LibraryWatchState } from '@/models/library-entry.model';
import { LibraryEntryQueries } from '@/stores/queries/libraryEntryQueries';

interface Props {
  readonly entry: LibraryEntry;
}

const watchStates: readonly { readonly value: LibraryWatchState; readonly label: string }[] = [
  { value: 'planned', label: 'Watchlist' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'dropped', label: 'Dropped' },
];

const toDateInputValue = (value: string | null): string => value?.slice(0, 10) ?? '';
const toIsoDate = (value: string): string | null =>
  value === '' ? null : new Date(`${value}T00:00:00.000Z`).toISOString();

const isDateOrderValid = (startedAt: string | null, completedAt: string | null): boolean =>
  startedAt === null || completedAt === null || startedAt <= completedAt;

export const LibraryEntryEditor = ({ entry }: Props) => {
  const notesId = useId();
  const statusId = useId();
  const ratingId = useId();
  const startedAtId = useId();
  const completedAtId = useId();
  const lastWatchedAtId = useId();
  const seasonId = useId();
  const episodeId = useId();
  const watchedEpisodeCountId = useId();
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
        <div className="grid gap-1">
          <Label htmlFor={statusId}>Status</Label>
          <Select
            value={watchState}
            onValueChange={value => setWatchState(value as LibraryWatchState)}
          >
            <SelectTrigger id={statusId}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {watchStates.map(state => (
                <SelectItem key={state.value} value={state.value}>
                  {state.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label htmlFor={ratingId}>Rating (1–10)</Label>
          <NumberField
            id={ratingId}
            min={1}
            max={10}
            step={1}
            value={rating}
            onChange={setRating}
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor={startedAtId}>Started</Label>
          <DatePicker id={startedAtId} value={startedAt} onChange={setStartedAt} />
        </div>
        <div className="grid gap-1">
          <Label htmlFor={completedAtId}>Completed</Label>
          <DatePicker id={completedAtId} value={completedAt} onChange={setCompletedAt} />
        </div>
        <div className="grid gap-1">
          <Label htmlFor={lastWatchedAtId}>Last watched</Label>
          <DatePicker id={lastWatchedAtId} value={lastWatchedAt} onChange={setLastWatchedAt} />
        </div>
      </div>
      {entry.mediaType === 'tv' && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="grid gap-1">
            <Label htmlFor={seasonId}>Season</Label>
            <NumberField id={seasonId} min={1} step={1} value={season} onChange={setSeason} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={episodeId}>Episode</Label>
            <NumberField id={episodeId} min={1} step={1} value={episode} onChange={setEpisode} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor={watchedEpisodeCountId}>Episodes watched</Label>
            <NumberField
              id={watchedEpisodeCountId}
              min={1}
              step={1}
              value={watchedEpisodeCount}
              onChange={setWatchedEpisodeCount}
            />
          </div>
        </div>
      )}
      <div className="grid gap-1">
        <Label htmlFor={notesId}>Notes</Label>
        <Textarea id={notesId} value={notes} onChange={event => setNotes(event.target.value)} />
      </div>
      {error !== null && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" disabled={upsert.isPending}>
          Save changes
        </Button>
        <p aria-live="polite" role="status" className="text-sm text-muted-foreground">
          {upsert.isSuccess ? 'Library entry saved.' : ''}
        </p>
      </div>
    </form>
  );
};
