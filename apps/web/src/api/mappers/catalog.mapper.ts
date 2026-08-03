import { catalogPageDtoSchema } from '../dtos/catalog.dto';
import type { CatalogPage } from '@/models/catalog-query.model';
export const fromCatalogPageDto = (value: unknown): CatalogPage | null => {
  const parsed = catalogPageDtoSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  console.error('[CatalogMapper] Invalid catalog response.', parsed.error.issues);
  return null;
};
