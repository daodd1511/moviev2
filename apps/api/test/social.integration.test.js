import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/app.js';
import Collection from '../src/model/collection.js';
import CollectionLike from '../src/model/collection-like.js';
import Follow from '../src/model/follow.js';
import { bearerAuth, signAccessToken } from './helpers/auth.js';
import { createUser } from './helpers/factories.js';

const createCollection = (app, token, overrides = {}) =>
  request(app)
    .post('/api/collections')
    .set(bearerAuth(token))
    .send({
      name: 'Shared',
      description: null,
      visibility: 'public',
      items: [],
      cover: null,
      ...overrides,
    });

describe('Social API', () => {
  it('follows and unfollows a public profile, staying idempotent and self-follow-safe', async () => {
    const app = createApp();
    const { user: follower } = await createUser();
    const { user: target } = await createUser({ social: { publicProfile: true } });
    const token = signAccessToken(follower);

    const selfFollow = await request(app)
      .post(`/api/social/follow/${follower.username}`)
      .set(bearerAuth(token));
    expect(selfFollow.status).toBe(400);

    const first = await request(app)
      .post(`/api/social/follow/${target.username}`)
      .set(bearerAuth(token));
    const duplicate = await request(app)
      .post(`/api/social/follow/${target.username}`)
      .set(bearerAuth(token));
    expect(first.status).toBe(204);
    expect(duplicate.status).toBe(204);
    expect(await Follow.countDocuments({ followerId: follower._id, followingId: target._id })).toBe(
      1,
    );

    const unfollowed = await request(app)
      .delete(`/api/social/follow/${target.username}`)
      .set(bearerAuth(token));
    expect(unfollowed.status).toBe(204);
    expect(await Follow.countDocuments({})).toBe(0);
  });

  it('hides a profile that has not opted in to being public', async () => {
    const app = createApp();
    const { user: viewer } = await createUser();
    const { user: target } = await createUser();

    const profile = await request(app)
      .get(`/api/social/profile/${target.username}`)
      .set(bearerAuth(signAccessToken(viewer)));
    expect(profile).toMatchObject({ status: 404, body: { error: { code: 'user_not_found' } } });

    const follow = await request(app)
      .post(`/api/social/follow/${target.username}`)
      .set(bearerAuth(signAccessToken(viewer)));
    expect(follow.status).toBe(404);
  });

  it('reports reconciled counts and the viewer’s own follow state on a public profile', async () => {
    const app = createApp();
    const { user: alice } = await createUser();
    const { user: bob } = await createUser();
    const { user: target } = await createUser({ social: { publicProfile: true } });
    await request(app)
      .post(`/api/social/follow/${target.username}`)
      .set(bearerAuth(signAccessToken(alice)));
    await request(app)
      .post(`/api/social/follow/${target.username}`)
      .set(bearerAuth(signAccessToken(bob)));

    const asAlice = await request(app)
      .get(`/api/social/profile/${target.username}`)
      .set(bearerAuth(signAccessToken(alice)));
    const anonymous = await request(app).get(`/api/social/profile/${target.username}`);

    expect(asAlice.body).toMatchObject({ followerCount: 2, isFollowedByViewer: true });
    expect(asAlice.body.email).toBeUndefined();
    expect(anonymous.body).toMatchObject({ followerCount: 2, isFollowedByViewer: false });
  });

  it('keeps follower/following lists private when the owner opts out, per-list', async () => {
    const app = createApp();
    const { user: follower } = await createUser();
    const { user: target } = await createUser({
      social: { publicProfile: true, showFollowers: false, showFollowing: true },
    });
    await request(app)
      .post(`/api/social/follow/${target.username}`)
      .set(bearerAuth(signAccessToken(follower)));

    const followers = await request(app).get(`/api/social/profile/${target.username}/followers`);
    const following = await request(app).get(`/api/social/profile/${target.username}/following`);

    expect(followers.body.followers).toEqual([]);
    expect(following.status).toBe(200);
  });

  it('likes only public Collections, staying idempotent, and reconciles the derived count on unlike', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: liker } = await createUser();
    const publicCollection = await createCollection(app, signAccessToken(owner));
    const privateCollection = await createCollection(app, signAccessToken(owner), {
      visibility: 'private',
    });
    const likerToken = signAccessToken(liker);

    const blockedLike = await request(app)
      .post(`/api/social/collections/${privateCollection.body.id}/like`)
      .set(bearerAuth(likerToken));
    expect(blockedLike.status).toBe(404);

    await request(app)
      .post(`/api/social/collections/${publicCollection.body.id}/like`)
      .set(bearerAuth(likerToken));
    await request(app)
      .post(`/api/social/collections/${publicCollection.body.id}/like`)
      .set(bearerAuth(likerToken));
    expect((await Collection.findById(publicCollection.body.id)).likeCount).toBe(1);

    await request(app)
      .delete(`/api/social/collections/${publicCollection.body.id}/like`)
      .set(bearerAuth(likerToken));
    await request(app)
      .delete(`/api/social/collections/${publicCollection.body.id}/like`)
      .set(bearerAuth(likerToken));
    expect((await Collection.findById(publicCollection.body.id)).likeCount).toBe(0);
    expect(await CollectionLike.countDocuments({})).toBe(0);
  });

  it('clears likes when a Collection leaves public visibility or is deleted', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: liker } = await createUser();
    const ownerToken = signAccessToken(owner);
    const created = await createCollection(app, ownerToken);
    await request(app)
      .post(`/api/social/collections/${created.body.id}/like`)
      .set(bearerAuth(signAccessToken(liker)));

    const unlisted = await request(app)
      .patch(`/api/collections/${created.body.id}`)
      .set(bearerAuth(ownerToken))
      .send({ visibility: 'unlisted', version: created.body.version });
    expect(unlisted.body.likeCount).toBe(0);
    expect(await CollectionLike.countDocuments({ collectionId: created.body.id })).toBe(0);

    const madePublicAgain = await request(app)
      .patch(`/api/collections/${created.body.id}`)
      .set(bearerAuth(ownerToken))
      .send({ visibility: 'public', version: unlisted.body.version });
    await request(app)
      .post(`/api/social/collections/${created.body.id}/like`)
      .set(bearerAuth(signAccessToken(liker)));
    expect((await Collection.findById(created.body.id)).likeCount).toBe(1);

    await request(app)
      .delete(`/api/collections/${created.body.id}`)
      .set(bearerAuth(ownerToken))
      .send({ version: madePublicAgain.body.version });
    expect(await CollectionLike.countDocuments({ collectionId: created.body.id })).toBe(0);
  });

  it('sorts public Collection discovery by likes and excludes non-public Collections', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: liker } = await createUser();
    const ownerToken = signAccessToken(owner);
    const popular = await createCollection(app, ownerToken, { name: 'Popular' });
    await createCollection(app, ownerToken, { name: 'Quiet' });
    await createCollection(app, ownerToken, { name: 'Hidden', visibility: 'private' });
    await request(app)
      .post(`/api/social/collections/${popular.body.id}/like`)
      .set(bearerAuth(signAccessToken(liker)));

    const response = await request(app).get('/api/social/collections?sort=popular');

    expect(response.body.collections.map(item => item.name)).toEqual(['Popular', 'Quiet']);
    expect(response.body.collections[0]).toMatchObject({
      ownerUsername: owner.username,
      likeCount: 1,
    });
  });
});
