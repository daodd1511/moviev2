import { backendApi } from '..';
import { fromCatalogPageDto } from '../mappers/catalog.mapper';
import type {
  CatalogDiscoverInput,
  CatalogPage,
  CatalogSearchType,
} from '@/models/catalog-query.model';
const page = (value: unknown): CatalogPage => {
  const result = fromCatalogPageDto(value);
  if (result === null) throw new Error('The Catalog response was invalid.');
  return result;
};
export const CatalogService = {
  search: async (query: string, type: CatalogSearchType, pageNumber = 1) =>
    page(
      (
        await backendApi.get<unknown>('/catalog/search', {
          params: { query, type, page: pageNumber },
        })
      ).data,
    ),
  discover: async (input: CatalogDiscoverInput) =>
    page((await backendApi.get<unknown>('/catalog/discover', { params: input })).data),
};
