import {
  LibraryEntryFilters,
  LibraryMediaType,
  LibraryWatchState,
} from '@/models/library-entry.model';

interface Props {
  readonly filters: LibraryEntryFilters;
  readonly onChange: (filters: LibraryEntryFilters) => void;
}

const watchStates: readonly { readonly value: LibraryWatchState; readonly label: string }[] = [
  { value: 'planned', label: 'Watchlist' },
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
  { value: 'dropped', label: 'Dropped' },
];

const mediaTypes: readonly { readonly value: LibraryMediaType; readonly label: string }[] = [
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV shows' },
];

export const LibraryFilters = ({ filters, onChange }: Props) => {
  const update = (next: Partial<LibraryEntryFilters>) => onChange({ ...filters, ...next });

  const handleWatchStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    update({
      watchState: event.target.value === '' ? undefined : (event.target.value as LibraryWatchState),
    });
  };
  const handleMediaTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    update({
      mediaType: event.target.value === '' ? undefined : (event.target.value as LibraryMediaType),
    });
  };
  const handleRatingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    update({ minRating: event.target.value === '' ? undefined : Number(event.target.value) });
  };
  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    update({ sort: event.target.value === 'lastWatchedAt' ? 'lastWatchedAt' : 'updatedAt' });
  };

  return (
    <section aria-label="Library filters" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="grid gap-1.5 text-sm font-medium">
        Status
        <select
          value={filters.watchState ?? ''}
          onChange={handleWatchStateChange}
          className="rounded-lg border border-input bg-transparent px-3 py-2"
        >
          <option value="">All statuses</option>
          {watchStates.map(state => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Type
        <select
          value={filters.mediaType ?? ''}
          onChange={handleMediaTypeChange}
          className="rounded-lg border border-input bg-transparent px-3 py-2"
        >
          <option value="">Movies and TV</option>
          {mediaTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Rating
        <select
          value={filters.minRating ?? ''}
          onChange={handleRatingChange}
          className="rounded-lg border border-input bg-transparent px-3 py-2"
        >
          <option value="">Any rating</option>
          {Array.from({ length: 10 }, (_, index) => index + 1).map(rating => (
            <option key={rating} value={rating}>
              {rating}+
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Sort
        <select
          value={filters.sort ?? 'updatedAt'}
          onChange={handleSortChange}
          className="rounded-lg border border-input bg-transparent px-3 py-2"
        >
          <option value="updatedAt">Recently updated</option>
          <option value="lastWatchedAt">Recently watched</option>
        </select>
      </label>
    </section>
  );
};
