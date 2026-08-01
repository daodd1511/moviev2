import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { buildMedia, createUser } from './helpers/factories.js';
import { bearerAuth, signAccessToken } from './helpers/auth.js';

// ListService.create returns the raw input, not the Mongoose-assigned subdocument, so
// the create response has no `_id` (pre-existing behavior, unchanged by this phase).
// Fetch the list back to get its real id.
const createList = async (app, token, overrides = {}) => {
  const name = overrides.name ?? 'My List';
  await request(app)
    .post('/api/list')
    .set(bearerAuth(token))
    .send({ name, description: 'A list', movies: [], tvShows: [], ...overrides });

  const all = await request(app).get('/api/list').set(bearerAuth(token));
  return all.body.find(list => list.name === name);
};

describe('list ownership', () => {
  it('lets an owner create, read, and delete their own list', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);

    const list = await createList(app, token);
    expect(list.name).toBe('My List');

    const getRes = await request(app).get(`/api/list/${list._id}`).set(bearerAuth(token));
    expect(getRes.status).toBe(200);

    const deleteRes = await request(app).delete(`/api/list/${list._id}`).set(bearerAuth(token));
    expect(deleteRes.status).toBe(200);
  });

  it('rejects all list routes without authentication', async () => {
    const app = createApp();
    const res = await request(app).get('/api/list');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('unauthorized');
  });

  it("returns list_not_found for another user's list id (no cross-account access)", async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: other } = await createUser();
    const ownerToken = signAccessToken(owner);
    const otherToken = signAccessToken(other);

    const list = await createList(app, ownerToken);

    const res = await request(app).get(`/api/list/${list._id}`).set(bearerAuth(otherToken));

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('list_not_found');
  });
});

describe('list input validation', () => {
  it('rejects an invalid Mongo id in the path', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);

    const res = await request(app).get('/api/list/not-a-valid-id').set(bearerAuth(token));

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });

  it('rejects an empty list name', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);

    const res = await request(app)
      .post('/api/list')
      .set(bearerAuth(token))
      .send({ name: '', description: '', movies: [], tvShows: [] });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });

  it('rejects a malformed media payload on add-movie', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);
    const list = await createList(app, token);

    const res = await request(app)
      .post(`/api/list/${list._id}/movie`)
      .set(bearerAuth(token))
      .send({ id: 'not-a-number', title: 'x' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });
});

describe('duplicate media handling', () => {
  it('rejects adding the same movie twice', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);
    const list = await createList(app, token);
    const media = buildMedia();

    const first = await request(app)
      .post(`/api/list/${list._id}/movie`)
      .set(bearerAuth(token))
      .send(media);
    expect(first.status).toBe(200);

    const second = await request(app)
      .post(`/api/list/${list._id}/movie`)
      .set(bearerAuth(token))
      .send(media);
    expect(second.status).toBe(409);
    expect(second.body.error.code).toBe('media_already_in_list');
  });

  it('does not treat a tv show and movie with the same numeric id as duplicates', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);
    const list = await createList(app, token);
    const movie = buildMedia({ id: 42, type: 'movie' });
    const tv = buildMedia({ id: 42, type: 'tv' });

    const movieRes = await request(app)
      .post(`/api/list/${list._id}/movie`)
      .set(bearerAuth(token))
      .send(movie);
    expect(movieRes.status).toBe(200);

    const tvRes = await request(app)
      .post(`/api/list/${list._id}/tv`)
      .set(bearerAuth(token))
      .send(tv);
    expect(tvRes.status).toBe(200);
  });

  it('removes a movie that is in the list and 404s removing one that is not', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);
    const list = await createList(app, token);
    const media = buildMedia();

    await request(app).post(`/api/list/${list._id}/movie`).set(bearerAuth(token)).send(media);

    const removed = await request(app)
      .delete(`/api/list/${list._id}/movie`)
      .set(bearerAuth(token))
      .send(media);
    expect(removed.status).toBe(200);

    const removedAgain = await request(app)
      .delete(`/api/list/${list._id}/movie`)
      .set(bearerAuth(token))
      .send(media);
    expect(removedAgain.status).toBe(404);
    expect(removedAgain.body.error.code).toBe('media_not_in_list');
  });
});

describe('GET /api/user/list/:username/:listId (public list)', () => {
  it('returns a public list by username and list id', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);
    const list = await createList(app, token);

    const res = await request(app).get(`/api/user/list/${user.username}/${list._id}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('My List');
  });

  it('returns not-found for an unknown username', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);
    const list = await createList(app, token);

    const res = await request(app).get(`/api/user/list/no-such-user/${list._id}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('user_not_found');
  });

  it('rejects an invalid list id in the path', async () => {
    const app = createApp();
    const { user } = await createUser();

    const res = await request(app).get(`/api/user/list/${user.username}/not-a-valid-id`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });
});

describe('clear operations', () => {
  it('rejects GET on the removed clear routes', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);
    const list = await createList(app, token);

    // GET /list/clear now falls through to GET /list/:id with id="clear", which
    // correctly fails Mongo-id validation rather than clearing anything.
    const clearAllGet = await request(app).get('/api/list/clear').set(bearerAuth(token));
    expect(clearAllGet.status).toBe(400);
    expect(clearAllGet.body.error.code).toBe('validation_error');

    // GET /list/:id/clear no longer matches any route at all.
    const clearOneGet = await request(app)
      .get(`/api/list/${list._id}/clear`)
      .set(bearerAuth(token));
    expect(clearOneGet.status).toBe(404);
  });

  it('accepts DELETE /api/list/:id/items to clear one list', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);
    const list = await createList(app, token);
    await request(app)
      .post(`/api/list/${list._id}/movie`)
      .set(bearerAuth(token))
      .send(buildMedia());

    const res = await request(app).delete(`/api/list/${list._id}/items`).set(bearerAuth(token));

    expect(res.status).toBe(200);
    expect(res.body.movies).toEqual([]);
  });

  it('accepts DELETE /api/list to clear all lists', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);
    await createList(app, token);
    await createList(app, token, { name: 'Second list' });

    const res = await request(app).delete('/api/list').set(bearerAuth(token));
    expect(res.status).toBe(200);

    const getAll = await request(app).get('/api/list').set(bearerAuth(token));
    expect(getAll.body).toEqual([]);
  });
});
