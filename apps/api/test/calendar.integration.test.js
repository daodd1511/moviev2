import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import CatalogSyncState from '../src/model/catalog-sync-state.js';
import { bearerAuth, signAccessToken } from './helpers/auth.js';
import { createUser } from './helpers/factories.js';
describe('Calendar API', () => {
  it('returns only the authenticated user tracked releases within the requested range', async () => {
    const { user } = await createUser();
    const { user: other } = await createUser();
    await CatalogSyncState.create({
      key: 'catalog-release-sync',
      releases: [
        {
          ownerId: user._id,
          mediaType: 'movie',
          tmdbId: 1,
          title: 'Mine',
          releaseDate: new Date('2026-01-10'),
        },
        {
          ownerId: other._id,
          mediaType: 'tv',
          tmdbId: 2,
          title: 'Other',
          releaseDate: new Date('2026-01-10'),
        },
      ],
    });
    const response = await request(createApp())
      .get('/api/calendar')
      .query({ from: '2026-01-01', to: '2026-01-31', timezone: 'Asia/Ho_Chi_Minh' })
      .set(bearerAuth(signAccessToken(user)));
    expect(response.status).toBe(200);
    expect(response.body.releases).toHaveLength(1);
    expect(response.body.releases[0].title).toBe('Mine');
  });
});
