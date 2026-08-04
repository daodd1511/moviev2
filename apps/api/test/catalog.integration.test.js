import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { CatalogCache } from '../src/catalog/catalogCache.js';
import { CatalogProviderError } from '../src/catalog/catalogProvider.js';
import { TmdbCatalogProvider } from '../src/catalog/tmdbCatalogProvider.js';
import CatalogService from '../src/service/catalogService.js';

const media = {
  id: 11,
  mediaType: 'movie',
  title: 'Fixture movie',
  overview: '',
  posterPath: null,
  backdropPath: null,
  releaseDate: '2026-01-01',
  voteAverage: 8,
  popularity: 10,
};
const person = {
  id: 12,
  mediaType: 'person',
  name: 'Fixture person',
  profilePath: null,
  popularity: 4,
};

const genre = { id: 28, name: 'Action' };

const provider = (overrides = {}) => ({
  search: vi.fn(async () => ({ page: 1, totalPages: 1, results: [media, person] })),
  discover: vi.fn(async () => ({ page: 1, totalPages: 1, results: [media] })),
  getMedia: vi.fn(async () => media),
  getReleaseSchedule: vi.fn(async () => ({ page: 1, totalPages: 1, results: [media] })),
  getGenres: vi.fn(async () => [genre]),
  ...overrides,
});

afterEach(() => CatalogService.resetForTesting());

describe('Catalog API', () => {
  it('maps search, discovery, media, and schedule requests through the provider boundary', async () => {
    const fakeProvider = provider();
    CatalogService.configureForTesting({
      nextProvider: fakeProvider,
      nextCache: new CatalogCache(),
    });
    const app = createApp();

    const [search, discover, detail, schedule] = await Promise.all([
      request(app).get('/api/catalog/search').query({ query: 'fixture', type: 'person' }),
      request(app)
        .get('/api/catalog/discover')
        .query({ mediaType: 'movie', page: 2, with_genres: '28' }),
      request(app).get('/api/catalog/movie/11'),
      request(app)
        .get('/api/catalog/schedule')
        .query({ mediaType: 'tv', from: '2026-01-01', to: '2026-01-31' }),
    ]);

    expect(search.body.results).toContainEqual(person);
    expect(discover.body.results).toEqual([media]);
    expect(detail.body).toEqual(media);
    expect(schedule.body.results).toEqual([media]);
    expect(fakeProvider.search).toHaveBeenCalledWith({ query: 'fixture', type: 'person', page: 1 });
    expect(fakeProvider.discover).toHaveBeenCalledWith({
      mediaType: 'movie',
      page: 2,
      with_genres: '28',
    });
  });

  it('caches matching requests, expires entries, and validates query boundaries', async () => {
    let now = 0;
    const fakeProvider = provider();
    CatalogService.configureForTesting({
      nextProvider: fakeProvider,
      nextCache: new CatalogCache({ ttlMs: 10, now: () => now, maxEntries: 1 }),
    });
    const app = createApp();
    await request(app).get('/api/catalog/search').query({ query: 'fixture' });
    await request(app).get('/api/catalog/search').query({ query: 'fixture' });
    now = 11;
    await request(app).get('/api/catalog/search').query({ query: 'fixture' });
    const invalid = await request(app)
      .get('/api/catalog/schedule')
      .query({ mediaType: 'movie', from: '2026-02-01', to: '2026-01-01' });

    expect(fakeProvider.search).toHaveBeenCalledTimes(2);
    expect(invalid.status).toBe(400);
    expect(invalid.body.error.code).toBe('validation_error');
  });

  it('normalizes rate limits, timeouts, and malformed TMDB payloads without upstream details', async () => {
    const app = createApp();
    CatalogService.configureForTesting({
      nextProvider: provider({
        search: vi.fn(async () => {
          throw new CatalogProviderError({
            code: 'catalog_rate_limited',
            message: 'Catalog is busy. Try again shortly.',
            status: 429,
            retryAfter: '30',
          });
        }),
      }),
      nextCache: new CatalogCache(),
    });
    const limited = await request(app).get('/api/catalog/search').query({ query: 'fixture' });
    expect(limited.status).toBe(429);
    expect(limited.body.error).toMatchObject({
      code: 'catalog_rate_limited',
      details: { retryAfter: '30' },
    });

    const malformedProvider = new TmdbCatalogProvider({
      apiKey: 'test',
      fetchImpl: async () => new Response('{', { status: 200 }),
    });
    await expect(malformedProvider.search({ query: 'fixture' })).rejects.toMatchObject({
      code: 'catalog_upstream_invalid',
    });

    const timeoutProvider = new TmdbCatalogProvider({
      apiKey: 'test',
      timeoutMs: 1,
      fetchImpl: (_url, { signal }) =>
        new Promise((_resolve, reject) =>
          signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError'))),
        ),
    });
    await expect(timeoutProvider.search({ query: 'fixture' })).rejects.toMatchObject({
      code: 'catalog_timeout',
      status: 504,
    });
  });

  it('routes a category to the provider and rejects a mismatched category/mediaType pair', async () => {
    const fakeProvider = provider();
    CatalogService.configureForTesting({
      nextProvider: fakeProvider,
      nextCache: new CatalogCache(),
    });
    const app = createApp();

    const categorized = await request(app)
      .get('/api/catalog/discover')
      .query({ mediaType: 'tv', category: 'on_the_air', page: 1 });
    expect(categorized.status).toBe(200);
    expect(fakeProvider.discover).toHaveBeenCalledWith({
      mediaType: 'tv',
      category: 'on_the_air',
      page: 1,
    });

    const mismatched = await request(app)
      .get('/api/catalog/discover')
      .query({ mediaType: 'movie', category: 'on_the_air' });
    expect(mismatched.status).toBe(400);
    expect(mismatched.body.error.code).toBe('validation_error');
  });

  it('calls the TMDB category endpoint when a category is given and /discover otherwise', async () => {
    const provider = new TmdbCatalogProvider({
      apiKey: 'test',
      fetchImpl: vi.fn(async () => Response.json({ page: 1, total_pages: 1, results: [] })),
    });

    await provider.discover({ mediaType: 'movie', category: 'top_rated', page: 1 });
    expect(provider.fetchImpl).toHaveBeenLastCalledWith(
      expect.stringContaining('/movie/top_rated?'),
      expect.anything(),
    );

    await provider.discover({ mediaType: 'movie', page: 1 });
    expect(provider.fetchImpl).toHaveBeenLastCalledWith(
      expect.stringContaining('/discover/movie?'),
      expect.anything(),
    );
  });

  it('returns genres and keys the cache separately per category', async () => {
    const fakeProvider = provider();
    const cache = new CatalogCache();
    CatalogService.configureForTesting({ nextProvider: fakeProvider, nextCache: cache });
    const app = createApp();

    const genres = await request(app).get('/api/catalog/genres').query({ mediaType: 'movie' });
    expect(genres.status).toBe(200);
    expect(genres.body).toEqual([genre]);
    expect(fakeProvider.getGenres).toHaveBeenCalledWith({ mediaType: 'movie' });

    await request(app)
      .get('/api/catalog/discover')
      .query({ mediaType: 'movie', category: 'popular' });
    await request(app)
      .get('/api/catalog/discover')
      .query({ mediaType: 'movie', category: 'top_rated' });
    await request(app).get('/api/catalog/discover').query({ mediaType: 'movie' });

    expect(fakeProvider.discover).toHaveBeenCalledTimes(3);
  });
});
