import Collection from '../model/collection.js';
import User from '../model/user.js';
import { AppError } from '../errors/app-error.js';

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
    if (collection === null) return null;
    return { source: 'collection', value: collection };
  },
};

export default CollectionCompatibilityService;
