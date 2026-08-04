import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { CatalogService } from '@/api/services/catalogService';
import type {
  CatalogDiscoverInput,
  CatalogMediaType,
  CatalogSearchType,
} from '@/models/catalog-query.model';

export const catalogKeys = {
  discover: (input: CatalogDiscoverInput) => ['catalog', 'discover', input] as const,
  search: (query: string, type: CatalogSearchType) => ['catalog', 'search', query, type] as const,
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
  useInfiniteSearch: (query: string, type: CatalogSearchType) =>
    useInfiniteQuery({
      queryKey: catalogKeys.search(query, type),
      queryFn: ({ pageParam }) => CatalogService.search(query, type, pageParam),
      initialPageParam: 1,
      getNextPageParam: lastPage =>
        lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
      enabled: query.trim().length > 0,
    }),
  useGenres: (mediaType: CatalogMediaType) =>
    useQuery({
      queryKey: catalogKeys.genres(mediaType),
      queryFn: () => CatalogService.getGenres(mediaType),
      staleTime: Infinity,
    }),
};
