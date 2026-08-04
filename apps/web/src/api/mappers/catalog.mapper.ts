import { catalogGenreDtoSchema, catalogPageDtoSchema } from '../dtos/catalog.dto';
import type { CatalogGenre, CatalogPage } from '@/models/catalog-query.model';
export const fromCatalogPageDto = (value: unknown): CatalogPage | null => {
  const parsed = catalogPageDtoSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  console.error('[CatalogMapper] Invalid catalog response.', parsed.error.issues);
  return null;
};
export const fromCatalogGenreDto = (value: unknown): readonly CatalogGenre[] | null => {
  const parsed = catalogGenreDtoSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  console.error('[CatalogMapper] Invalid genre response.', parsed.error.issues);
  return null;
};
