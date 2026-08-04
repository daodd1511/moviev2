import { afterEach, describe, expect, it } from 'vitest';
import LibraryEntry from '../src/model/library-entry.js';
import CatalogSyncState from '../src/model/catalog-sync-state.js';
import CatalogService from '../src/service/catalogService.js';
import CatalogSyncService from '../src/service/catalogSyncService.js';
import { createUser } from './helpers/factories.js';

afterEach(() => CatalogService.resetForTesting());
describe('CatalogSyncService', () => {
  it('refreshes tracked entries only, supports dry runs, and persists a resume cursor', async () => {
    const { user } = await createUser();
    await LibraryEntry.create({
      ownerId: user._id,
      mediaType: 'movie',
      tmdbId: 1,
      watchState: 'planned',
      mediaSnapshot: { title: 'Tracked', voteAverage: 1 },
    });
    CatalogService.configureForTesting({
      nextProvider: {
        getMedia: async () => ({ title: 'Fresh', releaseDate: '2026-02-01', posterPath: null }),
      },
      nextCache: { get: () => undefined, set: (_key, value) => value },
    });
    const dry = await CatalogSyncService.run({ dryRun: true, limit: 1 });
    expect(dry.audit).toEqual({ scanned: 1, updated: 1 });
    expect(await CatalogSyncState.countDocuments()).toBe(0);
    const executed = await CatalogSyncService.run({ dryRun: false, limit: 1 });
    expect(executed.cursor).not.toBeNull();
    expect((await CatalogSyncState.findOne()).releases).toHaveLength(1);
  });
});
