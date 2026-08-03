import Notification from '../model/notification.js';
import NotificationPreference from '../model/notification-preference.js';

const DEFAULT_PREFERENCES = { timezone: 'UTC', events: { release: true } };

/** Converts a release date into the UTC instant of local midnight in the given IANA
 * timezone, so a notification is scheduled against the recipient's own calendar day. */
const scheduledAtFor = (releaseDate, timezone) => {
  const utcGuess = Date.UTC(
    releaseDate.getUTCFullYear(),
    releaseDate.getUTCMonth(),
    releaseDate.getUTCDate(),
  );
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(new Date(utcGuess))
      .map(({ type, value }) => [type, value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return new Date(utcGuess - (asUtc - utcGuess));
};

const dedupeKeyFor = ({ mediaType, tmdbId, releaseDate }) =>
  `release:${mediaType}:${tmdbId}:${releaseDate.toISOString().slice(0, 10)}`;

const NotificationService = {
  async list(userId, { unreadOnly } = {}) {
    const query = { recipientId: userId };
    if (unreadOnly === 'true') query.readAt = null;
    return Notification.find(query).sort({ scheduledAt: -1, createdAt: -1 });
  },

  async markRead(userId, id) {
    return Notification.findOneAndUpdate(
      { _id: id, recipientId: userId },
      { $set: { readAt: new Date() } },
      { new: true },
    );
  },

  async getPreferences(userId) {
    const preference = await NotificationPreference.findOne({ userId });
    return preference ?? { userId, ...DEFAULT_PREFERENCES };
  },

  async updatePreferences(userId, input) {
    const $set = { ...input };
    if (input.events) $set.events = { ...DEFAULT_PREFERENCES.events, ...input.events };
    return NotificationPreference.findOneAndUpdate(
      { userId },
      { $set, $setOnInsert: { userId } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  },

  /** Creates one deduplicated in-app notification for a tracked release, or does
   * nothing if the recipient opted out of release notifications or it already exists. */
  async notifyRelease({ recipientId, mediaType, tmdbId, title, releaseDate }) {
    if (releaseDate === null) return null;
    const preference = await this.getPreferences(recipientId);
    if (preference.events?.release === false) return null;
    const dedupeKey = dedupeKeyFor({ mediaType, tmdbId, releaseDate });
    const scheduledAt = scheduledAtFor(releaseDate, preference.timezone ?? 'UTC');
    try {
      return await Notification.findOneAndUpdate(
        { recipientId, dedupeKey },
        {
          $setOnInsert: {
            recipientId,
            eventType: 'release',
            mediaType,
            tmdbId,
            title,
            dedupeKey,
            scheduledAt,
            deliveredAt: new Date(),
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    } catch (error) {
      if (error.code === 11000) return null;
      throw error;
    }
  },
};

export default NotificationService;
