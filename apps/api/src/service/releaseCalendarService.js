import CatalogSyncState from '../model/catalog-sync-state.js';
const ReleaseCalendarService = {
  async list(userId, { from, to }) {
    const state = await CatalogSyncState.findOne({ key: 'catalog-release-sync' });
    const start = new Date(from);
    const end = new Date(to);
    return (state?.releases ?? []).filter(
      item =>
        item.ownerId.equals(userId) &&
        item.releaseDate !== null &&
        item.releaseDate >= start &&
        item.releaseDate <= end,
    );
  },
};
export default ReleaseCalendarService;
