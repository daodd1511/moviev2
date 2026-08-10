import { ChangeEvent, useState } from 'react';
import { Check, Plus, Search as SearchIcon, Star, X } from 'lucide-react';

import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { CollectionItem } from '@/models/collection.model';
import { MovieSearch, TvSearch } from '@/models/search.model';
import { Loader } from '@/shared/components';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';
import { useDebounce } from '@/shared/hooks';
import { formatToYear } from '@/shared/utils';
import { SearchQueries } from '@/stores/queries/searchQueries';

const MINIMUM_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

interface Props {
  /** Dialog visibility, owned by the host so the trigger can live anywhere. */
  readonly open: boolean;

  /** Visibility change handler; clears the query on close. */
  readonly onOpenChange: (open: boolean) => void;

  /** Keys already in the Collection, rendered as “Added” and not selectable. */
  readonly existingKeys: ReadonlySet<string>;

  /** Adds the chosen title. The dialog stays open so several titles can be added in a row. */
  readonly onAdd: (item: CollectionItem) => void;

  /** Disables every add action while a mutation is in flight. */
  readonly isAdding: boolean;
}

const itemKey = (item: { readonly mediaType: string; readonly tmdbId: number }): string =>
  `${item.mediaType}:${item.tmdbId}`;

/** Flattens a search hit into the Collection's own item shape. */
const toCollectionItem = (result: MovieSearch | TvSearch): CollectionItem =>
  result instanceof MovieSearch
    ? {
        mediaType: 'movie',
        tmdbId: result.id,
        title: result.title,
        posterPath: result.posterPath,
        releaseDate: result.releaseDate,
        voteAverage: result.voteAverage,
      }
    : {
        mediaType: 'tv',
        tmdbId: result.id,
        title: result.name,
        posterPath: result.posterPath,
        releaseDate: result.firstAirDate,
        voteAverage: result.voteAverage,
      };

/**
 * Title picker for a Collection, built on the same dialog shell as the global search:
 * one search field, poster-led results. Selecting a row adds it to the Collection
 * instead of navigating.
 */
export const AddTitlesDialog = ({ open, onOpenChange, existingKeys, onAdd, isAdding }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedQuery = searchQuery.trim();
  const debouncedQuery = useDebounce(normalizedQuery, SEARCH_DEBOUNCE_MS);
  const { data, isPending, isError, error } = SearchQueries.useMulti(debouncedQuery);

  const isDebouncing = normalizedQuery !== debouncedQuery;
  const canSearch = normalizedQuery.length >= MINIMUM_QUERY_LENGTH;
  const isSearching = canSearch && (isDebouncing || isPending);
  const results = isDebouncing ? undefined : data;

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setSearchQuery('');
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-4 w-[calc(100vw-2rem)] max-w-none -translate-y-0 gap-0 overflow-hidden border border-foreground/10 bg-popover/98 p-0 shadow-[0_32px_90px_-24px_rgba(0,0,0,0.9)] sm:top-[10svh] sm:w-[min(94vw,48rem)] sm:max-w-none"
      >
        <DialogTitle className="sr-only">Add titles to this Collection</DialogTitle>

        <div className="flex h-16 items-center gap-3 border-b border-foreground/10 px-4 sm:px-5">
          <SearchIcon aria-hidden="true" className="size-5 shrink-0 text-primary" />
          <input
            autoFocus
            type="search"
            value={searchQuery}
            placeholder="Search titles to add…"
            aria-label="Search titles to add"
            className="h-full min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground sm:text-lg"
            onChange={handleSearchChange}
          />
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close search"
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </DialogClose>
        </div>

        <div className="max-h-[70svh] min-h-40 overflow-y-auto">
          {!canSearch && (
            <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
              <p className="text-sm font-medium text-foreground">Find a title to add</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter at least {MINIMUM_QUERY_LENGTH} characters to search.
              </p>
            </div>
          )}

          {isSearching && <Loader className="min-h-48" />}

          {canSearch && !isSearching && isError && (
            <div className="flex min-h-40 items-center justify-center p-6 text-sm text-destructive">
              Search failed: {error.message}
            </div>
          )}

          {canSearch && !isSearching && !isError && results?.length === 0 && (
            <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
              <p className="text-sm font-medium text-foreground">No titles found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try a different title or spelling.
              </p>
            </div>
          )}

          {canSearch && !isSearching && !isError && results !== undefined && results.length > 0 && (
            <ul aria-live="polite">
              {results.map(result => {
                const item = toCollectionItem(result);
                const exists = existingKeys.has(itemKey(item));
                return (
                  <li key={itemKey(item)} className="border-b border-foreground/10 last:border-b-0">
                    <button
                      type="button"
                      disabled={exists || isAdding}
                      onClick={() => onAdd(item)}
                      className="flex w-full gap-4 px-4 py-3.5 text-left transition-colors outline-none hover:bg-foreground/[0.16] focus-visible:bg-foreground/[0.16] disabled:pointer-events-none disabled:opacity-60 sm:px-5"
                    >
                      <img
                        src={
                          item.posterPath === null
                            ? '/images/no-image.png'
                            : `${IMAGE_BASE_URL}${PosterSizes.small}${item.posterPath}`
                        }
                        alt=""
                        loading="lazy"
                        className="aspect-2/3 h-24 shrink-0 rounded-md object-cover outline outline-1 outline-foreground/10"
                      />
                      <span className="min-w-0 flex-1 py-0.5">
                        <span className="flex items-start gap-3">
                          <span className="truncate text-base font-medium text-foreground">
                            {item.title}
                          </span>
                          <span className="ml-auto shrink-0 rounded-full border border-foreground/10 bg-foreground/[0.08] px-2 py-0.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {item.mediaType === 'movie' ? 'Movie' : 'TV'}
                          </span>
                        </span>
                        <span className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatToYear(item.releaseDate)}</span>
                          {item.voteAverage > 0 && (
                            <span className="inline-flex items-center gap-1 text-primary">
                              <Star aria-hidden="true" className="size-3 fill-current" />
                              {item.voteAverage.toFixed(1)}
                            </span>
                          )}
                        </span>
                        {result.overview !== '' && (
                          <span className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            {result.overview}
                          </span>
                        )}
                      </span>
                      <span className="flex shrink-0 items-center gap-1 self-center text-sm font-medium text-muted-foreground">
                        {exists ? (
                          <>
                            <Check aria-hidden="true" className="size-4" /> Added
                          </>
                        ) : (
                          <>
                            <Plus aria-hidden="true" className="size-4" /> Add
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
