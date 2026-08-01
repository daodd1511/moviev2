import { AppError } from '../errors/app-error.js';
import LibraryEntry from '../model/library-entry.js';

const notFound = () =>
  new AppError({
    status: 404,
    code: 'library_entry_not_found',
    message: 'Library entry not found.',
  });

const buildFilters = (ownerId, filters) => {
  const query = { ownerId };
  if (filters.watchState) query.watchState = filters.watchState;
  if (filters.mediaType) query.mediaType = filters.mediaType;
  if (filters.minRating || filters.maxRating) {
    query.rating = {};
    if (filters.minRating) query.rating.$gte = filters.minRating;
    if (filters.maxRating) query.rating.$lte = filters.maxRating;
  }
  return query;
};

const upsertWithRetry = async (ownerId, input) => {
  const filter = { ownerId, mediaType: input.mediaType, tmdbId: input.tmdbId };
  const update = { ...input };

  try {
    return await LibraryEntry.findOneAndUpdate(
      filter,
      { $set: update, $setOnInsert: { ownerId } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
  } catch (error) {
    if (error?.code !== 11000) throw error;

    return LibraryEntry.findOneAndUpdate(
      filter,
      { $set: update },
      { new: true, runValidators: true },
    );
  }
};

const LibraryEntryService = {
  async list(ownerId, filters) {
    const query = buildFilters(ownerId, filters);
    const direction = filters.order === 'asc' ? 1 : -1;
    return LibraryEntry.find(query).sort({ [filters.sort]: direction, _id: direction });
  },

  async upsert(ownerId, input) {
    return upsertWithRetry(ownerId, input);
  },

  async remove(ownerId, mediaType, tmdbId) {
    const entry = await LibraryEntry.findOneAndDelete({ ownerId, mediaType, tmdbId });
    if (!entry) throw notFound();
  },
};

export default LibraryEntryService;
