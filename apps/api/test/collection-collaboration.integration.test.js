import { describe, expect, it } from 'vitest';
import request from 'supertest';

import { createApp } from '../src/app.js';
import Collection from '../src/model/collection.js';
import CollectionInvitation from '../src/model/collection-invitation.js';
import Notification from '../src/model/notification.js';
import { bearerAuth, signAccessToken } from './helpers/auth.js';
import { buildMedia, createUser } from './helpers/factories.js';

const toItem = media => ({
  mediaType: media.type,
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
      name: 'Shared',
      description: null,
      visibility: 'private',
      items: [],
      cover: null,
      ...overrides,
    });

const invite = (app, token, id, username, role) =>
  request(app)
    .post(`/api/collections/${id}/collaborators`)
    .set(bearerAuth(token))
    .send({ username, role });

const respond = (app, token, invitationId, decision) =>
  request(app)
    .post(`/api/collections/invitations/${invitationId}/respond`)
    .set(bearerAuth(token))
    .send({ decision });

describe('Collection collaboration', () => {
  it('invites by username, notifies the invitee, and grants the role on accept', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: editor } = await createUser();
    const created = await createCollection(app, signAccessToken(owner));

    const invitation = await invite(
      app,
      signAccessToken(owner),
      created.body.id,
      editor.username,
      'editor',
    );
    expect(invitation.status).toBe(201);
    expect(invitation.body.status).toBe('pending');
    expect(invitation.body.collectionName).toBe('Shared');

    const notified = await Notification.findOne({ recipientId: editor._id });
    expect(notified?.eventType).toBe('collection_invite');
    expect(notified?.collectionId.toString()).toBe(created.body.id);

    const inbox = await request(app)
      .get('/api/collections/invitations')
      .set(bearerAuth(signAccessToken(editor)));
    expect(inbox.body.invitations).toHaveLength(1);

    const accepted = await respond(app, signAccessToken(editor), invitation.body.id, 'accept');
    expect(accepted.status).toBe(200);
    expect(accepted.body.status).toBe('accepted');

    const collection = await Collection.findById(created.body.id);
    expect(collection.collaborators).toContainEqual(
      expect.objectContaining({ userId: editor._id, role: 'editor' }),
    );
  });

  it('lets an editor mutate items, blocks a viewer, and hides the private Collection from strangers', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: editor } = await createUser();
    const { user: viewer } = await createUser();
    const { user: stranger } = await createUser();
    const created = await createCollection(app, signAccessToken(owner));

    const editorInvite = await invite(
      app,
      signAccessToken(owner),
      created.body.id,
      editor.username,
      'editor',
    );
    await respond(app, signAccessToken(editor), editorInvite.body.id, 'accept');
    const viewerInvite = await invite(
      app,
      signAccessToken(owner),
      created.body.id,
      viewer.username,
      'viewer',
    );
    await respond(app, signAccessToken(viewer), viewerInvite.body.id, 'accept');

    const item = toItem(buildMedia());
    const asEditor = await request(app)
      .post(`/api/collections/${created.body.id}/items`)
      .set(bearerAuth(signAccessToken(editor)))
      .send({ item, version: created.body.version });
    expect(asEditor.status).toBe(200);

    const asViewer = await request(app)
      .post(`/api/collections/${created.body.id}/items`)
      .set(bearerAuth(signAccessToken(viewer)))
      .send({ item: toItem(buildMedia()), version: asEditor.body.version });
    expect(asViewer).toMatchObject({
      status: 403,
      body: { error: { code: 'collection_forbidden' } },
    });

    const asStranger = await request(app)
      .get(`/api/collections/${created.body.id}`)
      .set(bearerAuth(signAccessToken(stranger)));
    expect(asStranger.status).toBe(404);
  });

  it('rejects a stale version on an editor item mutation', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: editor } = await createUser();
    const created = await createCollection(app, signAccessToken(owner));
    const editorInvite = await invite(
      app,
      signAccessToken(owner),
      created.body.id,
      editor.username,
      'editor',
    );
    await respond(app, signAccessToken(editor), editorInvite.body.id, 'accept');

    const stale = await request(app)
      .post(`/api/collections/${created.body.id}/items`)
      .set(bearerAuth(signAccessToken(editor)))
      .send({ item: toItem(buildMedia()), version: created.body.version + 1 });

    expect(stale).toMatchObject({
      status: 409,
      body: { error: { code: 'collection_version_conflict' } },
    });
  });

  it('expires a pending invitation past its TTL and refuses a response', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: invitee } = await createUser();
    const created = await createCollection(app, signAccessToken(owner));
    const invitation = await invite(
      app,
      signAccessToken(owner),
      created.body.id,
      invitee.username,
      'viewer',
    );
    await CollectionInvitation.updateOne(
      { _id: invitation.body.id },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );

    const late = await respond(app, signAccessToken(invitee), invitation.body.id, 'accept');
    expect(late).toMatchObject({
      status: 409,
      body: { error: { code: 'invitation_not_pending' } },
    });
    expect((await CollectionInvitation.findById(invitation.body.id)).status).toBe('expired');
  });

  it('only the owner may revoke, and only one pending invitation exists per invitee', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: editor } = await createUser();
    const { user: invitee } = await createUser();
    const created = await createCollection(app, signAccessToken(owner));
    const editorInvite = await invite(
      app,
      signAccessToken(owner),
      created.body.id,
      editor.username,
      'editor',
    );
    await respond(app, signAccessToken(editor), editorInvite.body.id, 'accept');

    const first = await invite(
      app,
      signAccessToken(owner),
      created.body.id,
      invitee.username,
      'viewer',
    );
    const duplicate = await invite(
      app,
      signAccessToken(owner),
      created.body.id,
      invitee.username,
      'editor',
    );
    expect(duplicate).toMatchObject({
      status: 409,
      body: { error: { code: 'invitation_not_pending' } },
    });

    const revokeByEditor = await request(app)
      .post(`/api/collections/invitations/${first.body.id}/revoke`)
      .set(bearerAuth(signAccessToken(editor)));
    expect(revokeByEditor.status).toBe(403);

    const revokeByOwner = await request(app)
      .post(`/api/collections/invitations/${first.body.id}/revoke`)
      .set(bearerAuth(signAccessToken(owner)));
    expect(revokeByOwner.status).toBe(200);
    expect(revokeByOwner.body.status).toBe('revoked');
  });

  it('preserves exactly one owner across role changes, removal, and ownership transfer', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: editor } = await createUser();
    const created = await createCollection(app, signAccessToken(owner));
    const editorInvite = await invite(
      app,
      signAccessToken(owner),
      created.body.id,
      editor.username,
      'editor',
    );
    await respond(app, signAccessToken(editor), editorInvite.body.id, 'accept');

    const changeOwnerRole = await request(app)
      .patch(`/api/collections/${created.body.id}/collaborators/${owner._id}`)
      .set(bearerAuth(signAccessToken(owner)))
      .send({ role: 'viewer' });
    expect(changeOwnerRole.status).toBe(400);

    const removeOwner = await request(app)
      .delete(`/api/collections/${created.body.id}/collaborators/${owner._id}`)
      .set(bearerAuth(signAccessToken(owner)));
    expect(removeOwner.status).toBe(400);

    const transfer = await request(app)
      .post(`/api/collections/${created.body.id}/transfer`)
      .set(bearerAuth(signAccessToken(owner)))
      .send({ userId: editor._id.toString() });
    expect(transfer.status).toBe(200);
    const collaborators = transfer.body.collaborators;
    expect(collaborators.find(c => c.userId === editor._id.toString()).role).toBe('owner');
    expect(collaborators.find(c => c.userId === owner._id.toString()).role).toBe('editor');
    expect(collaborators.filter(c => c.role === 'owner')).toHaveLength(1);

    const formerOwnerRetries = await request(app)
      .post(`/api/collections/${created.body.id}/transfer`)
      .set(bearerAuth(signAccessToken(owner)))
      .send({ userId: editor._id.toString() });
    expect(formerOwnerRetries.status).toBe(403);
  });

  it('keeps an invitee’s inbox private to their own invitations', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: invitee } = await createUser();
    const { user: other } = await createUser();
    const created = await createCollection(app, signAccessToken(owner));
    await invite(app, signAccessToken(owner), created.body.id, invitee.username, 'viewer');

    const otherInbox = await request(app)
      .get('/api/collections/invitations')
      .set(bearerAuth(signAccessToken(other)));
    expect(otherInbox.body.invitations).toHaveLength(0);
  });
});
