import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { CatalogService } from '@/api/services/catalogService';
import type {
  CatalogDiscoverInput,
  CatalogMediaType,
  CatalogSearchType,
} from '@/models/catalog-query.model';

export const catalogKeys = {
  discover: (input: CatalogDiscoverInput) => ['catalog', 'discover', input] as const,
  search: (query: string, type: CatalogSearchType, page: number) =>
    ['catalog', 'search', query, type, page] as const,
  genres: (mediaType: CatalogMediaType) => ['catalog', 'genres', mediaType] as const,
};

export const CatalogQueries = {
  useInfiniteDiscover: (input: Omit<CatalogDiscoverInput, 'page'>) =>
    useInfiniteQuery({
      queryKey: catalogKeys.discover({ ...input, page: 1 }),
      queryFn: ({ pageParam }) => CatalogService.discover({ ...input, page: pageParam }),
      initialPageParam: 1,
      getNextPageParam: lastPage =>
        lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    }),
  useSearch: (query: string, type: CatalogSearchType, page: number) =>
    useQuery({
      queryKey: catalogKeys.search(query, type, page),
      queryFn: () => CatalogService.search(query, type, page),
      enabled: query.trim().length > 0,
    }),
  useGenres: (mediaType: CatalogMediaType) =>
    useQuery({
      queryKey: catalogKeys.genres(mediaType),
      queryFn: () => CatalogService.getGenres(mediaType),
      staleTime: Infinity,
    }),
};
