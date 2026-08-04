import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LibraryEntryService } from '@/api/services/libraryEntryService';
import {
  LibraryEntry,
  LibraryEntryFilters,
  LibraryEntryInput,
  LibraryEntryKey,
} from '@/models/library-entry.model';

const libraryEntryKeys = {
  all: ['libraryEntries'] as const,
  list: (filters: LibraryEntryFilters) => [...libraryEntryKeys.all, 'list', filters] as const,
};

const isMatchingEntry = (entry: LibraryEntry, filters: LibraryEntryFilters): boolean =>
  (filters.watchState === undefined || entry.watchState === filters.watchState) &&
  (filters.mediaType === undefined || entry.mediaType === filters.mediaType) &&
  (filters.minRating === undefined ||
    (entry.rating !== null && entry.rating >= filters.minRating)) &&
  (filters.maxRating === undefined || (entry.rating !== null && entry.rating <= filters.maxRating));

const isSameEntry = (entry: LibraryEntry, key: LibraryEntryKey): boolean =>
  entry.mediaType === key.mediaType && entry.tmdbId === key.tmdbId;

const makeOptimisticEntry = (input: LibraryEntryInput): LibraryEntry => {
  const now = new Date().toISOString();
  return {
    id: `optimistic:${input.mediaType}:${input.tmdbId}`,
    ...input,
    createdAt: now,
    updatedAt: now,
  };
};

type CachedList = readonly LibraryEntry[];
type RollbackContext = readonly [readonly unknown[], CachedList | undefined][];

const getFilters = (key: readonly unknown[]): LibraryEntryFilters =>
  (key[2] as LibraryEntryFilters | undefined) ?? {};

export namespace LibraryEntryQueries {
  export const useList = (filters: LibraryEntryFilters) =>
    useQuery({
      queryKey: libraryEntryKeys.list(filters),
      queryFn: () => LibraryEntryService.list(filters),
    });

  export const useUpsert = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: LibraryEntryService.upsert,
      async onMutate(input): Promise<RollbackContext> {
        await queryClient.cancelQueries({ queryKey: libraryEntryKeys.all });
        const previous = queryClient.getQueriesData<CachedList>({ queryKey: libraryEntryKeys.all });
        const optimistic = makeOptimisticEntry(input);

        for (const [key, entries] of previous) {
          if (entries === undefined) continue;
          const filters = getFilters(key);
          const withoutExisting = entries.filter(entry => !isSameEntry(entry, input));
          queryClient.setQueryData<CachedList>(
            key,
            isMatchingEntry(optimistic, filters)
              ? [...withoutExisting, optimistic]
              : withoutExisting,
          );
        }
        return previous;
      },
      onError(_error, _input, context) {
        context?.forEach(([key, entries]) => queryClient.setQueryData<CachedList>(key, entries));
      },
      onSuccess(entry) {
        queryClient.setQueriesData<CachedList>({ queryKey: libraryEntryKeys.all }, entries => {
          if (entries === undefined) return entries;
          return entries.map(candidate => (isSameEntry(candidate, entry) ? entry : candidate));
        });
      },
      onSettled() {
        return queryClient.invalidateQueries({ queryKey: libraryEntryKeys.all });
      },
    });
  };

  export const useRemove = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: LibraryEntryService.remove,
      async onMutate(key): Promise<RollbackContext> {
        await queryClient.cancelQueries({ queryKey: libraryEntryKeys.all });
        const previous = queryClient.getQueriesData<CachedList>({ queryKey: libraryEntryKeys.all });
        previous.forEach(([queryKey, entries]) => {
          queryClient.setQueryData<CachedList>(
            queryKey,
            entries?.filter(entry => !isSameEntry(entry, key)),
          );
        });
        return previous;
      },
      onError(_error, _key, context) {
        context?.forEach(([queryKey, entries]) =>
          queryClient.setQueryData<CachedList>(queryKey, entries),
        );
      },
      onSettled() {
        return queryClient.invalidateQueries({ queryKey: libraryEntryKeys.all });
      },
    });
  };
}
