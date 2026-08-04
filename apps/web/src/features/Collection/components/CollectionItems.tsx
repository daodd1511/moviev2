import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { SearchService } from '@/api/services/searchService';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import type { Collection, CollectionItem, CollectionItemKey } from '@/models/collection.model';
import { MovieSearch, TvSearch } from '@/models/search.model';
import { getApiErrorMessage } from '@/api/utils/getApiErrorMessage';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';
import { useDebounce } from '@/shared/hooks';
import { CollectionQueries } from '@/stores/queries/collectionQueries';

interface CollectionItemsProps {
  readonly collection: Collection;
}

const itemKey = (item: CollectionItemKey): string => `${item.mediaType}:${item.tmdbId}`;

const itemFromSearchResult = (result: MovieSearch | TvSearch): CollectionItem => ({
  mediaType: result instanceof MovieSearch ? 'movie' : 'tv',
  tmdbId: result.id,
  title: result instanceof MovieSearch ? result.title : result.name,
  posterPath: result.posterPath,
  releaseDate: result instanceof MovieSearch ? result.releaseDate : result.firstAirDate,
  voteAverage: result.voteAverage,
});

export const CollectionItems = ({ collection }: CollectionItemsProps) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [results, setResults] = useState<readonly (MovieSearch | TvSearch)[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const addItem = CollectionQueries.useAddItem();
  const removeItem = CollectionQueries.useRemoveItem();
  const reorder = CollectionQueries.useReorder();
  const update = CollectionQueries.useUpdate();

  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (trimmed === '') {
      setResults([]);
      setIsSearching(false);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    SearchService.multi(trimmed)
      .then(data => {
        if (!cancelled) setResults(data);
      })
      .catch((error: unknown) => {
        if (!cancelled) toast.error(getApiErrorMessage(error, 'Could not search for titles.'));
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleAdd = (item: CollectionItem): void => {
    addItem.mutate(
      { id: collection.id, version: collection.version, item },
      {
        onSuccess: () => toast.success(`Added “${item.title}” to the Collection.`),
        onError: error => toast.error(getApiErrorMessage(error, 'Could not add this title.')),
      },
    );
  };

  const handleRemove = (item: CollectionItem): void => {
    removeItem.mutate(
      { id: collection.id, version: collection.version, item },
      {
        onSuccess: () => toast.success(`Removed “${item.title}”.`),
        onError: error => toast.error(getApiErrorMessage(error, 'Could not remove this title.')),
      },
    );
  };

  const handleMove = (item: CollectionItem, direction: -1 | 1): void => {
    const currentIndex = collection.items.findIndex(
      candidate => itemKey(candidate) === itemKey(item),
    );
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= collection.items.length) return;
    const nextItems = [...collection.items];
    const [moved] = nextItems.splice(currentIndex, 1);
    nextItems.splice(nextIndex, 0, moved);
    reorder.mutate(
      {
        id: collection.id,
        version: collection.version,
        items: nextItems.map(({ mediaType, tmdbId }) => ({ mediaType, tmdbId })),
      },
      {
        onError: error =>
          toast.error(getApiErrorMessage(error, 'Could not reorder the Collection.')),
      },
    );
  };

  const handleCover = (item: CollectionItem): void => {
    update.mutate(
      {
        id: collection.id,
        version: collection.version,
        cover: { mediaType: item.mediaType, tmdbId: item.tmdbId },
      },
      {
        onSuccess: () => toast.success(`Set “${item.title}” as the cover.`),
        onError: error => toast.error(getApiErrorMessage(error, 'Could not update the cover.')),
      },
    );
  };

  return (
    <section
      aria-labelledby="collection-items-heading"
      className="mt-10 border-t border-border pt-8"
    >
      <h2 id="collection-items-heading" className="text-xl font-semibold">
        Titles
      </h2>
      <Command shouldFilter={false} className="mt-4 rounded-lg border border-border">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search titles to add"
          aria-label="Search titles to add"
        />
        {query.trim() !== '' && (
          <CommandList>
            {isSearching ? (
              <CommandEmpty>Searching…</CommandEmpty>
            ) : results.length === 0 ? (
              <CommandEmpty>No titles found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map(result => {
                  const item = itemFromSearchResult(result);
                  const exists = collection.items.some(
                    candidate => itemKey(candidate) === itemKey(item),
                  );
                  return (
                    <CommandItem
                      key={itemKey(item)}
                      value={itemKey(item)}
                      disabled={exists || addItem.isPending}
                      onSelect={() => handleAdd(item)}
                    >
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                        {exists ? (
                          'Added'
                        ) : (
                          <>
                            <Plus aria-hidden="true" className="size-3.5" /> Add
                          </>
                        )}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        )}
      </Command>
      {collection.items.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">No titles in this Collection yet.</p>
      ) : (
        <ol className="mt-6 grid gap-3 sm:grid-cols-2">
          {collection.items.map((item, index) => {
            const imageUrl =
              item.posterPath === null
                ? '/images/no-image.png'
                : `${IMAGE_BASE_URL}${PosterSizes.small}${item.posterPath}`;
            const isCover =
              collection.cover !== null && itemKey(collection.cover) === itemKey(item);
            return (
              <li key={itemKey(item)} className="flex gap-3 rounded-lg border border-border p-3">
                <img
                  src={imageUrl}
                  alt=""
                  className="h-20 w-14 rounded object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.mediaType === 'movie' ? 'Movie' : 'TV'} · {item.releaseDate.slice(0, 4)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label={`Move ${item.title} up`}
                      disabled={index === 0 || reorder.isPending}
                      onClick={() => handleMove(item, -1)}
                    >
                      Move up
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label={`Move ${item.title} down`}
                      disabled={index === collection.items.length - 1 || reorder.isPending}
                      onClick={() => handleMove(item, 1)}
                    >
                      Move down
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isCover || update.isPending}
                      onClick={() => handleCover(item)}
                    >
                      {isCover ? 'Cover' : 'Set cover'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      disabled={removeItem.isPending}
                      onClick={() => handleRemove(item)}
                    >
                      <Trash2 aria-hidden="true" className="size-4" /> Remove
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
