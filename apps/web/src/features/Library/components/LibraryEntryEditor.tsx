import { FormEvent, useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Field, FieldLabel } from '@/components/ui/field';
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
  /** Called after a successful save, so a host dialog can dismiss itself. */
  readonly onSaved?: () => void;
  /** Renders a cancel action when provided; the host decides what dismissing means. */
  readonly onCancel?: () => void;
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

export const LibraryEntryEditor = ({ entry, onSaved, onCancel }: Props) => {
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
    upsert.mutate(input, {
      onSuccess: () => onSaved?.(),
      onError: () => setError('Could not save this Library entry.'),
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit} aria-label={`Edit ${entry.mediaSnapshot.title}`}>
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-6">
        <Field className="sm:col-span-3">
          <FieldLabel htmlFor={statusId}>Status</FieldLabel>
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
        </Field>
        <Field className="sm:col-span-3">
          <FieldLabel htmlFor={ratingId}>Rating (1–10)</FieldLabel>
          <NumberField
            id={ratingId}
            min={1}
            max={10}
            step={1}
            value={rating}
            onChange={setRating}
          />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor={startedAtId}>Started</FieldLabel>
          <DatePicker id={startedAtId} value={startedAt} onChange={setStartedAt} />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor={completedAtId}>Completed</FieldLabel>
          <DatePicker id={completedAtId} value={completedAt} onChange={setCompletedAt} />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor={lastWatchedAtId}>Last watched</FieldLabel>
          <DatePicker id={lastWatchedAtId} value={lastWatchedAt} onChange={setLastWatchedAt} />
        </Field>
        {entry.mediaType === 'tv' && (
          <>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={seasonId}>Season</FieldLabel>
              <NumberField id={seasonId} min={1} step={1} value={season} onChange={setSeason} />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={episodeId}>Episode</FieldLabel>
              <NumberField id={episodeId} min={1} step={1} value={episode} onChange={setEpisode} />
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={watchedEpisodeCountId}>Episodes watched</FieldLabel>
              <NumberField
                id={watchedEpisodeCountId}
                min={1}
                step={1}
                value={watchedEpisodeCount}
                onChange={setWatchedEpisodeCount}
              />
            </Field>
          </>
        )}
        <Field className="sm:col-span-6">
          <FieldLabel htmlFor={notesId}>Notes</FieldLabel>
          <Textarea id={notesId} value={notes} onChange={event => setNotes(event.target.value)} />
        </Field>
      </div>
      {error !== null && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}
      <p aria-live="polite" role="status" className="mt-4 text-sm text-muted-foreground empty:mt-0">
        {upsert.isSuccess ? 'Library entry saved.' : ''}
      </p>
      <DialogFooter className="mt-5 sm:items-center">
        {onCancel !== undefined && (
          <Button type="button" variant="outline" size="lg" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="lg" disabled={upsert.isPending}>
          Save changes
        </Button>
      </DialogFooter>
    </form>
  );
};
