import { describe, expect, it } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';

import { createApp } from '../src/app.js';
import Collection from '../src/model/collection.js';
import { bearerAuth, signAccessToken } from './helpers/auth.js';
import { createUser } from './helpers/factories.js';

const createCollection = (app, token, overrides = {}) =>
  request(app)
    .post('/api/collections')
    .set(bearerAuth(token))
    .send({
      name: 'Shared <script>alert(1)</script>',
      description: null,
      visibility: 'public',
      items: [],
      cover: null,
      ...overrides,
    });

describe('Share API', () => {
  it('renders an escaped Open Graph card for a public Collection at its canonical URL', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const created = await createCollection(app, signAccessToken(owner));

    const response = await request(app).get(`/u/${owner.username}/collections/${created.body.id}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
    expect(response.text).not.toContain('<script>alert(1)</script>');
    expect(response.text).toContain('Shared &lt;script&gt;alert(1)&lt;/script&gt;');
    const canonicalPath = `/u/${owner.username}/collections/${created.body.id}`;
    expect(response.text).toMatch(
      new RegExp(`<link rel="canonical" href="https?://[^"]*${canonicalPath}">`),
    );
    expect(response.text).toContain(`/#${canonicalPath}`);
  });

  it('resolves a legacy public id to the same card, canonicalized to the current owner and id', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const legacyId = new mongoose.Types.ObjectId().toString();
    const collection = await Collection.create({
      ownerId: owner._id,
      name: 'Legacy Share',
      description: null,
      visibility: 'unlisted',
      items: [],
      cover: null,
      legacyPublicId: legacyId,
    });

    const response = await request(app).get(`/u/${owner.username}/lists/${legacyId}`);

    expect(response.status).toBe(200);
    expect(response.text).toContain(
      `/u/${owner.username}/collections/${collection._id.toString()}`,
    );
  });

  it('404s with no metadata for a private Collection', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const created = await createCollection(app, signAccessToken(owner), {
      visibility: 'private',
      name: 'Secret',
    });

    const response = await request(app).get(`/u/${owner.username}/collections/${created.body.id}`);

    expect(response.status).toBe(404);
    expect(response.text).not.toContain('Secret');
    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('404s for an unknown Collection id', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const missingId = new mongoose.Types.ObjectId().toString();

    const response = await request(app).get(`/u/${owner.username}/collections/${missingId}`);

    expect(response.status).toBe(404);
  });
});
