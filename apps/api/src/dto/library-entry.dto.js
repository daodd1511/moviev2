/** Maps a private Library Entry document to the stable API response shape. */
export const toLibraryEntryDto = entry => ({
  id: entry._id.toString(),
  mediaType: entry.mediaType,
  tmdbId: entry.tmdbId,
  watchState: entry.watchState,
  rating: entry.rating,
  notes: entry.notes,
  startedAt: entry.startedAt,
  completedAt: entry.completedAt,
  lastWatchedAt: entry.lastWatchedAt,
  tvProgress: entry.tvProgress,
  mediaSnapshot: entry.mediaSnapshot,
  createdAt: entry.createdAt,
  updatedAt: entry.updatedAt,
});
