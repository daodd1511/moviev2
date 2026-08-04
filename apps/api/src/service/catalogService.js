import { CatalogCache } from '../catalog/catalogCache.js';
import { CatalogProviderError } from '../catalog/catalogProvider.js';
import { TmdbCatalogProvider } from '../catalog/tmdbCatalogProvider.js';
import { AppError } from '../errors/app-error.js';

let provider = new TmdbCatalogProvider();
let cache = new CatalogCache();

const cached = async (operation, input) => {
  const key = { operation, ...input };
  const cachedValue = cache.get(key);
  if (cachedValue !== undefined) return cachedValue;
  try {
    return cache.set(key, await provider[operation](input));
  } catch (error) {
    if (error instanceof CatalogProviderError) {
      throw new AppError({
        status: error.status,
        code: error.code,
        message: error.message,
        details: error.retryAfter === undefined ? undefined : { retryAfter: error.retryAfter },
        cause: error,
      });
    }
    throw error;
  }
};

const CatalogService = {
  search: input => cached('search', input),
  discover: input => cached('discover', input),
  getMedia: input => cached('getMedia', input),
  getReleaseSchedule: input => cached('getReleaseSchedule', input),
  getGenres: input => cached('getGenres', input),
  configureForTesting({ nextProvider, nextCache }) {
    provider = nextProvider;
    cache = nextCache;
  },
  resetForTesting() {
    provider = new TmdbCatalogProvider();
    cache = new CatalogCache();
  },
};

export default CatalogService;
