import { CatalogProvider, CatalogProviderError } from './catalogProvider.js';

const defaultBaseUrl = 'https://api.themoviedb.org/3';
const mediaType = value => (value === 'tv' ? 'tv' : 'movie');
const mapPerson = item => {
  if (typeof item.id !== 'number' || typeof item.name !== 'string') {
    throw new CatalogProviderError({
      code: 'catalog_upstream_invalid',
      message: 'Catalog data was invalid.',
    });
  }
  return {
    id: item.id,
    mediaType: 'person',
    name: item.name,
    profilePath: item.profile_path ?? null,
    popularity: item.popularity ?? 0,
  };
};
const mapMedia = (item, fallbackType) => {
  const type = mediaType(item.media_type ?? fallbackType);
  const title = item.title ?? item.name;
  if (typeof item.id !== 'number' || typeof title !== 'string') {
    throw new CatalogProviderError({
      code: 'catalog_upstream_invalid',
      message: 'Catalog data was invalid.',
    });
  }
  return {
    id: item.id,
    mediaType: type,
    title,
    overview: item.overview ?? '',
    posterPath: item.poster_path ?? null,
    backdropPath: item.backdrop_path ?? null,
    releaseDate: item.release_date ?? item.first_air_date ?? '',
    voteAverage: item.vote_average ?? 0,
    popularity: item.popularity ?? 0,
  };
};

export class TmdbCatalogProvider extends CatalogProvider {
  constructor({
    fetchImpl = fetch,
    apiKey = process.env.TMDB_API_KEY,
    baseUrl = defaultBaseUrl,
    timeoutMs = 5_000,
  } = {}) {
    super();
    this.fetchImpl = fetchImpl;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.timeoutMs = timeoutMs;
  }

  async request(path, params = {}) {
    if (!this.apiKey) {
      throw new CatalogProviderError({
        code: 'catalog_unavailable',
        message: 'Catalog is unavailable.',
        status: 503,
      });
    }
    const query = new URLSearchParams({
      api_key: this.apiKey,
      ...Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined)),
    });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await this.fetchImpl(`${this.baseUrl}${path}?${query}`, {
        signal: controller.signal,
      });
      if (response.status === 429) {
        throw new CatalogProviderError({
          code: 'catalog_rate_limited',
          message: 'Catalog is busy. Try again shortly.',
          status: 429,
          retryAfter: response.headers.get('retry-after') ?? undefined,
        });
      }
      if (!response.ok) {
        throw new CatalogProviderError({
          code: 'catalog_unavailable',
          message: 'Catalog is unavailable.',
          status: 502,
        });
      }
      try {
        return await response.json();
      } catch (cause) {
        throw new CatalogProviderError({
          code: 'catalog_upstream_invalid',
          message: 'Catalog data was invalid.',
          cause,
        });
      }
    } catch (error) {
      if (error instanceof CatalogProviderError) throw error;
      if (error.name === 'AbortError') {
        throw new CatalogProviderError({
          code: 'catalog_timeout',
          message: 'Catalog timed out. Try again.',
          status: 504,
        });
      }
      throw new CatalogProviderError({
        code: 'catalog_unavailable',
        message: 'Catalog is unavailable.',
        status: 502,
        cause: error,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  async search({ query, type = 'multi', page = 1 }) {
    const data = await this.request(`/search/${type}`, { query, page });
    if (!Array.isArray(data.results))
      throw new CatalogProviderError({
        code: 'catalog_upstream_invalid',
        message: 'Catalog data was invalid.',
      });
    return {
      page: data.page ?? page,
      totalPages: data.total_pages ?? 1,
      results: data.results.map(item =>
        (item.media_type ?? type) === 'person' ? mapPerson(item) : mapMedia(item, type),
      ),
    };
  }

  async discover({ mediaType: type, page = 1, ...filters }) {
    const data = await this.request(`/discover/${type}`, { page, ...filters });
    if (!Array.isArray(data.results))
      throw new CatalogProviderError({
        code: 'catalog_upstream_invalid',
        message: 'Catalog data was invalid.',
      });
    return {
      page: data.page ?? page,
      totalPages: data.total_pages ?? 1,
      results: data.results.map(item => mapMedia(item, type)),
    };
  }

  async getMedia({ mediaType: type, id }) {
    return mapMedia(await this.request(`/${type}/${id}`), type);
  }

  async getReleaseSchedule({ mediaType: type, from, to, page = 1 }) {
    const dates =
      type === 'movie'
        ? { 'primary_release_date.gte': from, 'primary_release_date.lte': to }
        : { 'first_air_date.gte': from, 'first_air_date.lte': to };
    return this.discover({ mediaType: type, page, ...dates });
  }
}
