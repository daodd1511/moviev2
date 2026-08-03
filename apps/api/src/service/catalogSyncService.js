import CatalogSyncState from '../model/catalog-sync-state.js';
import LibraryEntry from '../model/library-entry.js';
import CatalogService from './catalogService.js';
import NotificationService from './notificationService.js';
const TRACKED_WATCH_STATES = ['planned', 'watching'];
const toRelease = (entry, media) => ({
  ownerId: entry.ownerId,
  mediaType: entry.mediaType,
  tmdbId: entry.tmdbId,
  title: media.title,
  releaseDate: media.releaseDate === '' ? null : new Date(media.releaseDate),
  posterPath: media.posterPath,
});
const CatalogSyncService = {
  async run({ cursor = null, limit = 100, dryRun = true } = {}) {
    const query = cursor === null ? {} : { _id: { $gt: cursor } };
    const entries = await LibraryEntry.find(query).sort({ _id: 1 }).limit(limit);
    const releases = [];
    for (const entry of entries) {
      const media = await CatalogService.getMedia({ mediaType: entry.mediaType, id: entry.tmdbId });
      const release = toRelease(entry, media);
      releases.push(release);
      if (!dryRun && TRACKED_WATCH_STATES.includes(entry.watchState)) {
        await NotificationService.notifyRelease({
          recipientId: release.ownerId,
          mediaType: release.mediaType,
          tmdbId: release.tmdbId,
          title: release.title,
          releaseDate: release.releaseDate,
        });
      }
    }
    const nextCursor = entries.at(-1)?._id?.toString() ?? null;
    const audit = { scanned: entries.length, updated: releases.length };
    if (!dryRun)
      await CatalogSyncState.findOneAndUpdate(
        { key: 'catalog-release-sync' },
        { $set: { cursor: nextCursor, releases, lastRunAt: new Date(), audit } },
        { upsert: true, new: true },
      );
    return { cursor: nextCursor, audit, dryRun, releases };
  },
};
export default CatalogSyncService;
