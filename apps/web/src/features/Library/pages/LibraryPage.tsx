import { useSearchParams } from 'react-router-dom';
import { LibraryBig } from 'lucide-react';

import { Loader } from '@/shared/components';
import {
  LibraryEntryFilters,
  LibraryMediaType,
  LibraryWatchState,
} from '@/models/library-entry.model';
import { LibraryEntryQueries } from '@/stores/queries/libraryEntryQueries';

import { LibraryEntryCard } from '../components/LibraryEntryCard';
import { LibraryFilters } from '../components/LibraryFilters';

const watchStates: readonly LibraryWatchState[] = [
  'planned',
  'watching',
  'completed',
  'paused',
  'dropped',
];
const mediaTypes: readonly LibraryMediaType[] = ['movie', 'tv'];

const parseInteger = (value: string | null): number | undefined => {
  if (value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 && parsed <= 10 ? parsed : undefined;
};

const filtersFromParams = (params: URLSearchParams): LibraryEntryFilters => {
  const watchState = params.get('state');
  const mediaType = params.get('type');
  const sort = params.get('sort');
  return {
    watchState: watchStates.includes(watchState as LibraryWatchState)
      ? (watchState as LibraryWatchState)
      : undefined,
    mediaType: mediaTypes.includes(mediaType as LibraryMediaType)
      ? (mediaType as LibraryMediaType)
      : undefined,
    minRating: parseInteger(params.get('rating')),
    sort: sort === 'lastWatchedAt' ? 'lastWatchedAt' : 'updatedAt',
    order: 'desc',
  };
};

const paramsFromFilters = (filters: LibraryEntryFilters): URLSearchParams => {
  const params = new URLSearchParams();
  if (filters.watchState !== undefined) params.set('state', filters.watchState);
  if (filters.mediaType !== undefined) params.set('type', filters.mediaType);
  if (filters.minRating !== undefined) params.set('rating', String(filters.minRating));
  if (filters.sort === 'lastWatchedAt') params.set('sort', filters.sort);
  return params;
};

export const LibraryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromParams(searchParams);
  const { data: entries = [], isPending, isError } = LibraryEntryQueries.useList(filters);
  const handleFilterChange = (nextFilters: LibraryEntryFilters) =>
    setSearchParams(paramsFromFilters(nextFilters));

  if (isPending) return <Loader className="min-h-[60vh]" />;
  return (
    <main className="page-shell">
      <header className="mb-7">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Your library
        </p>
        <h1 className="mt-2 text-3xl leading-tight font-light tracking-tight md:text-4xl">
          Library
        </h1>
        <p className="mt-2 text-muted-foreground">
          Track your watchlist, notes, ratings, and progress.
        </p>
      </header>
      <LibraryFilters filters={filters} onChange={handleFilterChange} />
      {isError ? (
        <p role="alert" className="mt-8 text-destructive">
          Could not load your Library. Please try again.
        </p>
      ) : entries.length === 0 ? (
        <div className="mt-8 grid min-h-72 place-items-center border-y border-border text-center">
          <div>
            <LibraryBig className="mx-auto size-9 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-medium">No matching titles</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a movie or TV show from its details page to start your Library.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {entries.map(entry => (
            <LibraryEntryCard key={entry.id} entry={entry} sort={filters.sort} />
          ))}
        </div>
      )}
    </main>
  );
};
