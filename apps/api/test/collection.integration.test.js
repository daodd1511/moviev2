import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/app.js';
import Collection from '../src/model/collection.js';
import { bearerAuth, signAccessToken } from './helpers/auth.js';
import { buildMedia, createUser } from './helpers/factories.js';

const toItem = (media, mediaType = media.type) => ({
  mediaType,
  tmdbId: media.id,
  title: media.title,
  posterPath: media.posterPath,
  releaseDate: media.releaseDate,
  voteAverage: media.voteAverage,
});

const createCollection = (app, token, overrides = {}) =>
  request(app)
    .post('/api/collections')
    .set(bearerAuth(token))
    .send({
      name: 'My Collection',
      description: null,
      visibility: 'private',
      items: [],
      cover: null,
      ...overrides,
    });

describe('Collection API access and mutation', () => {
  it('keeps private Collections undiscoverable to non-owners and allows unlisted links', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: other } = await createUser();
    const created = await createCollection(app, signAccessToken(owner));

    const privateRead = await request(app)
      .get(`/api/collections/${created.body.id}`)
      .set(bearerAuth(signAccessToken(other)));
    expect(privateRead.status).toBe(404);
    expect(privateRead.body.error.code).toBe('collection_not_found');

    const unlisted = await request(app)
      .patch(`/api/collections/${created.body.id}`)
      .set(bearerAuth(signAccessToken(owner)))
      .send({ visibility: 'unlisted', version: created.body.version });
    const unlistedRead = await request(app)
      .get(`/api/collections/${created.body.id}`)
      .set(bearerAuth(signAccessToken(other)));
    expect(unlisted.status).toBe(200);
    expect(unlistedRead.status).toBe(200);
  });

  it('uses item-level mutations, detects duplicate items and rejects stale reorders', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);
    const created = await createCollection(app, token);
    const firstItem = toItem(buildMedia({ type: 'movie' }));
    const secondItem = toItem(buildMedia({ type: 'tv' }));

    const first = await request(app)
      .post(`/api/collections/${created.body.id}/items`)
      .set(bearerAuth(token))
      .send({ item: firstItem, version: created.body.version });
    const duplicate = await request(app)
      .post(`/api/collections/${created.body.id}/items`)
      .set(bearerAuth(token))
      .send({ item: firstItem, version: first.body.version });
    const firstKey = { mediaType: firstItem.mediaType, tmdbId: firstItem.tmdbId };
    const secondKey = { mediaType: secondItem.mediaType, tmdbId: secondItem.tmdbId };
    const second = await request(app)
      .post(`/api/collections/${created.body.id}/items`)
      .set(bearerAuth(token))
      .send({ item: secondItem, version: first.body.version });
    const staleOrder = await request(app)
      .put(`/api/collections/${created.body.id}/items/order`)
      .set(bearerAuth(token))
      .send({ items: [firstKey, secondKey], version: first.body.version });
    const reordered = await request(app)
      .put(`/api/collections/${created.body.id}/items/order`)
      .set(bearerAuth(token))
      .send({ items: [secondKey, firstKey], version: second.body.version });

    expect(first.status).toBe(200);
    expect(duplicate).toMatchObject({
      status: 409,
      body: { error: { code: 'collection_item_exists' } },
    });
    expect(second.status).toBe(200);
    expect(staleOrder).toMatchObject({
      status: 409,
      body: { error: { code: 'collection_version_conflict' } },
    });
    expect(reordered.body.items.map(item => item.tmdbId)).toEqual([
      secondItem.tmdbId,
      firstItem.tmdbId,
    ]);
  });

  it('duplicates privately, deletes by version, and resolves migrated legacy links', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);
    const legacyId = '64d2e71e7ec7c778e7c01a11';
    const collection = await Collection.create({
      ownerId: user._id,
      name: 'Migrated',
      visibility: 'unlisted',
      legacyPublicId: legacyId,
      collaborators: [{ userId: user._id, role: 'owner' }],
      items: [toItem(buildMedia())],
    });

    const copied = await request(app)
      .post(`/api/collections/${collection._id}/duplicate`)
      .set(bearerAuth(token));
    const publicLegacy = await request(app).get(`/api/user/list/${user.username}/${legacyId}`);
    const removed = await request(app)
      .delete(`/api/collections/${collection._id}`)
      .set(bearerAuth(token))
      .send({ version: collection.version });

    expect(copied).toMatchObject({
      status: 201,
      body: { visibility: 'private', name: 'Migrated (copy)' },
    });
    expect(publicLegacy).toMatchObject({
      status: 200,
      body: { legacyPublicId: legacyId, name: 'Migrated' },
    });
    expect(removed.status).toBe(204);
  });
});
