import {
  LibraryEntryFilters,
  LibraryMediaType,
  LibraryWatchState,
} from '@/models/library-entry.model';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  readonly filters: LibraryEntryFilters;
  readonly onChange: (filters: LibraryEntryFilters) => void;
}

const ALL_WATCH_STATES = 'all';
const ALL_MEDIA_TYPES = 'all';
const ANY_RATING = 'any';

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

  const handleWatchStateChange = (value: string) => {
    update({ watchState: value === ALL_WATCH_STATES ? undefined : (value as LibraryWatchState) });
  };
  const handleMediaTypeChange = (value: string) => {
    update({ mediaType: value === ALL_MEDIA_TYPES ? undefined : (value as LibraryMediaType) });
  };
  const handleRatingChange = (value: string) => {
    update({ minRating: value === ANY_RATING ? undefined : Number(value) });
  };
  const handleSortChange = (value: string) => {
    update({ sort: value === 'lastWatchedAt' ? 'lastWatchedAt' : 'updatedAt' });
  };

  return (
    <section aria-label="Library filters" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="grid gap-1.5">
        <Label htmlFor="library-filter-status">Status</Label>
        <Select
          value={filters.watchState ?? ALL_WATCH_STATES}
          onValueChange={handleWatchStateChange}
        >
          <SelectTrigger id="library-filter-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_WATCH_STATES}>All statuses</SelectItem>
            {watchStates.map(state => (
              <SelectItem key={state.value} value={state.value}>
                {state.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="library-filter-type">Type</Label>
        <Select value={filters.mediaType ?? ALL_MEDIA_TYPES} onValueChange={handleMediaTypeChange}>
          <SelectTrigger id="library-filter-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_MEDIA_TYPES}>Movies and TV</SelectItem>
            {mediaTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="library-filter-rating">Rating</Label>
        <Select
          value={filters.minRating === undefined ? ANY_RATING : String(filters.minRating)}
          onValueChange={handleRatingChange}
        >
          <SelectTrigger id="library-filter-rating">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_RATING}>Any rating</SelectItem>
            {Array.from({ length: 10 }, (_, index) => index + 1).map(rating => (
              <SelectItem key={rating} value={String(rating)}>
                {rating}+
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="library-filter-sort">Sort</Label>
        <Select value={filters.sort ?? 'updatedAt'} onValueChange={handleSortChange}>
          <SelectTrigger id="library-filter-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">Recently updated</SelectItem>
            <SelectItem value="lastWatchedAt">Recently watched</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
};
