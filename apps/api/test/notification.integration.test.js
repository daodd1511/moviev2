import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import Notification from '../src/model/notification.js';
import { bearerAuth, signAccessToken } from './helpers/auth.js';
import { createUser } from './helpers/factories.js';

const buildNotification = (recipientId, overrides = {}) =>
  Notification.create({
    recipientId,
    eventType: 'release',
    mediaType: 'movie',
    tmdbId: 1,
    title: 'Tracked Movie',
    dedupeKey: `release:movie:1:2026-02-01`,
    scheduledAt: new Date('2026-02-01'),
    ...overrides,
  });

describe('Notification API', () => {
  it('only lists the authenticated user’s notifications', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: other } = await createUser();
    await buildNotification(owner._id);
    await buildNotification(other._id, { dedupeKey: 'release:movie:2:2026-02-02', tmdbId: 2 });

    const response = await request(app)
      .get('/api/notifications')
      .set(bearerAuth(signAccessToken(owner)));

    expect(response.status).toBe(200);
    expect(response.body.notifications).toHaveLength(1);
    expect(response.body.notifications[0].tmdbId).toBe(1);
  });

  it('marks only the owner’s notification as read and rejects cross-owner access', async () => {
    const app = createApp();
    const { user: owner } = await createUser();
    const { user: other } = await createUser();
    const notification = await buildNotification(owner._id);
    const ownerToken = signAccessToken(owner);
    const otherToken = signAccessToken(other);

    const crossOwner = await request(app)
      .post(`/api/notifications/${notification._id}/read`)
      .set(bearerAuth(otherToken));
    expect(crossOwner.status).toBe(404);

    const marked = await request(app)
      .post(`/api/notifications/${notification._id}/read`)
      .set(bearerAuth(ownerToken));
    expect(marked.status).toBe(200);
    expect(marked.body.readAt).not.toBeNull();
  });

  it('reads and updates per-event and timezone preferences', async () => {
    const app = createApp();
    const { user } = await createUser();
    const token = signAccessToken(user);

    const defaults = await request(app).get('/api/notifications/preferences').set(bearerAuth(token));
    expect(defaults.body).toEqual({ timezone: 'UTC', events: { release: true } });

    const updated = await request(app)
      .put('/api/notifications/preferences')
      .set(bearerAuth(token))
      .send({ timezone: 'Asia/Ho_Chi_Minh', events: { release: false } });
    expect(updated.status).toBe(200);
    expect(updated.body).toEqual({
      timezone: 'Asia/Ho_Chi_Minh',
      events: { release: false },
    });
  });
});
