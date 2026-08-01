import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import LibraryEntry from '../src/model/library-entry.js';
import { bearerAuth, signAccessToken } from './helpers/auth.js';
import { buildLibraryEntryInput, createUser } from './helpers/factories.js';

const upsert = (app, token, input) =>
  request(app).put('/api/library/entries').set(bearerAuth(token)).send(input);

describe('Library Entry ownership and upsert', () => {
  it('upserts one entry for the same media identity', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);
    const input = buildLibraryEntryInput();

    const first = await upsert(app, token, input);
    const second = await upsert(app, token, {
      ...input,
      watchState: 'watching',
      rating: 8,
      notes: 'Halfway through.',
    });

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body.watchState).toBe('watching');
    expect(second.body.rating).toBe(8);
    expect(await LibraryEntry.countDocuments({ ownerId: user._id })).toBe(1);
  });

  it('only lists and deletes the authenticated user’s entries', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: other } = await createUser();
    const ownerToken = signAccessToken(owner);
    const otherToken = signAccessToken(other);
    const input = buildLibraryEntryInput({ mediaType: 'tv', tmdbId: 42 });

    await upsert(app, ownerToken, input);

    const ownerEntries = await request(app).get('/api/library/entries').set(bearerAuth(ownerToken));
    const otherEntries = await request(app).get('/api/library/entries').set(bearerAuth(otherToken));
    const deletedByOther = await request(app)
      .delete('/api/library/entries/tv/42')
      .set(bearerAuth(otherToken));
    const deletedByOwner = await request(app)
      .delete('/api/library/entries/tv/42')
      .set(bearerAuth(ownerToken));

    expect(ownerEntries.body.entries).toHaveLength(1);
    expect(otherEntries.body.entries).toEqual([]);
    expect(deletedByOther.status).toBe(404);
    expect(deletedByOther.body.error.code).toBe('library_entry_not_found');
    expect(deletedByOwner.status).toBe(204);
  });

  it('filters entries by state, media type, rating, and recency ordering', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);

    await upsert(
      app,
      token,
      buildLibraryEntryInput({
        mediaType: 'movie',
        tmdbId: 1,
        watchState: 'planned',
        rating: 6,
        lastWatchedAt: '2024-01-01T00:00:00.000Z',
      }),
    );
    await upsert(
      app,
      token,
      buildLibraryEntryInput({
        mediaType: 'tv',
        tmdbId: 2,
        watchState: 'watching',
        rating: 9,
        lastWatchedAt: '2024-02-01T00:00:00.000Z',
      }),
    );

    const filtered = await request(app)
      .get('/api/library/entries')
      .query({ mediaType: 'tv', watchState: 'watching', minRating: 8, sort: 'lastWatchedAt' })
      .set(bearerAuth(token));

    expect(filtered.status).toBe(200);
    expect(filtered.body.entries).toHaveLength(1);
    expect(filtered.body.entries[0]).toMatchObject({ mediaType: 'tv', tmdbId: 2, rating: 9 });
  });

  it('requires authentication for Library routes', async () => {
    const app = createApp();

    const response = await request(app).get('/api/library/entries');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('unauthorized');
  });
});

describe('Library Entry validation', () => {
  it.each(['planned', 'watching', 'completed', 'paused', 'dropped'])(
    'accepts the %s watch state',
    async watchState => {
      const app = createApp();
      const { user } = await createUser();
      const token = signAccessToken(user);

      const response = await upsert(app, token, buildLibraryEntryInput({ watchState }));

      expect(response.status).toBe(200);
      expect(response.body.watchState).toBe(watchState);
    },
  );

  it.each([
    [
      'fractional ratings',
      buildLibraryEntryInput({ rating: 7.5 }),
      'rating',
    ],
    [
      'completion dates before start dates',
      buildLibraryEntryInput({
        startedAt: '2024-02-01T00:00:00.000Z',
        completedAt: '2024-01-01T00:00:00.000Z',
      }),
      'completedAt',
    ],
    [
      'TV progress on movies',
      buildLibraryEntryInput({ tvProgress: { season: 1, episode: 1 } }),
      'tvProgress',
    ],
    [
      'zero-valued TV progress',
      buildLibraryEntryInput({
        mediaType: 'tv',
        tvProgress: { season: 0, episode: 1 },
      }),
      'tvProgress',
    ],
  ])('rejects %s', async (_label, input, field) => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);

    const response = await upsert(app, token, input);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('validation_error');
    expect(response.body.error.details.some(detail => detail.path.includes(field))).toBe(true);
  });

  it('rejects an inverted rating range and invalid delete params', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);

    const badRange = await request(app)
      .get('/api/library/entries')
      .query({ minRating: 9, maxRating: 3 })
      .set(bearerAuth(token));
    const badParams = await request(app)
      .delete('/api/library/entries/book/not-a-number')
      .set(bearerAuth(token));

    expect(badRange.status).toBe(400);
    expect(badParams.status).toBe(400);
  });
});
