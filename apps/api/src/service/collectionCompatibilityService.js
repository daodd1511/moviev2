import Collection from '../model/collection.js';
import User from '../model/user.js';
import { AppError } from '../errors/app-error.js';

const toLegacyItem = (media, mediaType) => ({
  mediaType,
  tmdbId: media.id,
  title: media.title,
  posterPath: media.posterPath,
  releaseDate: media.releaseDate,
  voteAverage: media.voteAverage,
});

const CollectionCompatibilityService = {
  async getLegacyPublic(username, legacyId) {
    const user = await User.findOne({ username }).lean();
    if (user === null) {
      throw new AppError({ status: 404, code: 'user_not_found', message: 'User not found.' });
    }

    const collection = await Collection.findOne({
      ownerId: user._id,
      legacyPublicId: legacyId,
    }).lean();
    if (collection !== null) return { source: 'collection', value: collection };

    const list = user.lists.find(candidate => candidate._id.toString() === legacyId);
    if (list === undefined) return null;
    return {
      source: 'legacy',
      value: {
        ...list,
        ownerId: user._id,
        visibility: 'unlisted',
        legacyPublicId: legacyId,
        items: [
          ...list.movies.map(media => toLegacyItem(media, 'movie')),
          ...list.tvShows.map(media => toLegacyItem(media, 'tv')),
        ],
      },
    };
  },
};

export default CollectionCompatibilityService;
