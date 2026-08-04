import { afterEach, describe, expect, it } from 'vitest';
import LibraryEntry from '../src/model/library-entry.js';
import Notification from '../src/model/notification.js';
import NotificationPreference from '../src/model/notification-preference.js';
import NotificationService from '../src/service/notificationService.js';
import CatalogService from '../src/service/catalogService.js';
import CatalogSyncService from '../src/service/catalogSyncService.js';
import { createUser } from './helpers/factories.js';

const trackEntry = (user, overrides = {}) =>
  LibraryEntry.create({
    ownerId: user._id,
    mediaType: 'movie',
    tmdbId: 1,
    watchState: 'planned',
    mediaSnapshot: { title: 'Tracked', voteAverage: 1 },
    ...overrides,
  });

afterEach(() => CatalogService.resetForTesting());

describe('Notification delivery from catalog sync', () => {
  it('notifies only tracked, opted-in owners and stays deduplicated across repeated runs', async () => {
    const { user: tracked } = await createUser();
    const { user: optedOut } = await createUser();
    const { user: untracked } = await createUser();
    await trackEntry(tracked);
    await trackEntry(optedOut, { tmdbId: 2 });
    await trackEntry(untracked, { tmdbId: 3, watchState: 'dropped' });
    await NotificationPreference.create({ userId: optedOut._id, events: { release: false } });
    CatalogService.configureForTesting({
      nextProvider: {
        getMedia: async () => ({ title: 'Fresh', releaseDate: '2026-02-01', posterPath: null }),
      },
      nextCache: { get: () => undefined, set: (_key, value) => value },
    });

    await CatalogSyncService.run({ dryRun: false, limit: 10 });
    await CatalogSyncService.run({ dryRun: false, limit: 10 });

    const notifications = await Notification.find({});
    expect(notifications).toHaveLength(1);
    expect(notifications[0].recipientId.equals(tracked._id)).toBe(true);
  });

  it('schedules the notification at local midnight in the recipient’s timezone', async () => {
    const { user } = await createUser();
    await NotificationPreference.create({ userId: user._id, timezone: 'Asia/Ho_Chi_Minh' });

    await NotificationService.notifyRelease({
      recipientId: user._id,
      mediaType: 'movie',
      tmdbId: 1,
      title: 'Tracked',
      releaseDate: new Date('2026-02-01T00:00:00.000Z'),
    });

    const notification = await Notification.findOne({ recipientId: user._id });
    // Asia/Ho_Chi_Minh is UTC+7, so its local midnight is the prior UTC evening.
    expect(notification.scheduledAt.toISOString()).toBe('2026-01-31T17:00:00.000Z');
  });

  it('never carries auth tokens or Library notes into the sync job result', async () => {
    const { user } = await createUser();
    await trackEntry(user, { notes: 'Private note that must not leak.' });
    CatalogService.configureForTesting({
      nextProvider: {
        getMedia: async () => ({ title: 'Fresh', releaseDate: '2026-02-01', posterPath: null }),
      },
      nextCache: { get: () => undefined, set: (_key, value) => value },
    });

    const result = await CatalogSyncService.run({ dryRun: false, limit: 10 });
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain('Private note');
    expect(serialized).not.toMatch(/Bearer |token/i);
  });
});
