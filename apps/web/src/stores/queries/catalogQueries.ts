import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '@/api/services/catalogService';
import type { CatalogDiscoverInput, CatalogSearchType } from '@/models/catalog-query.model';

export const catalogKeys = {
  discover: (input: CatalogDiscoverInput) => ['catalog', 'discover', input] as const,
  search: (query: string, type: CatalogSearchType, page: number) =>
    ['catalog', 'search', query, type, page] as const,
};

export const CatalogQueries = {
  useDiscover: (input: CatalogDiscoverInput) =>
    useQuery({
      queryKey: catalogKeys.discover(input),
      queryFn: () => CatalogService.discover(input),
    }),
  useSearch: (query: string, type: CatalogSearchType, page: number) =>
    useQuery({
      queryKey: catalogKeys.search(query, type, page),
      queryFn: () => CatalogService.search(query, type, page),
      enabled: query.trim().length > 0,
    }),
};
