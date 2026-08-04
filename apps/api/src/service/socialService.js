import Collection from '../model/collection.js';
import CollectionLike from '../model/collection-like.js';
import Follow from '../model/follow.js';
import { AppError } from '../errors/app-error.js';
import { toSocialProfileDto } from '../dto/user.dto.js';
import UserService from './userService.js';

const userNotFound = () =>
  new AppError({ status: 404, code: 'user_not_found', message: 'User not found.' });
const collectionNotFound = () =>
  new AppError({ status: 404, code: 'collection_not_found', message: 'Collection not found.' });

/** Resolves a username to a discoverable (opted-in) User, or throws the same 404 as an
 * unknown username so a disabled public profile never confirms the account exists. */
const findPublicUser = async username => {
  const user = await UserService.getUserByUsername(username);
  if (user === null || !user.social.publicProfile) throw userNotFound();
  return user;
};

const SocialService = {
  async follow(actorId, username) {
    // Resolve before the public-profile gate: self-follow is a client bug independent
    // of the actor's own privacy setting, and an actor always already knows their own
    // username, so this ordering leaks nothing a 404-after-gate would have hidden.
    const rawTarget = await UserService.getUserByUsername(username);
    if (rawTarget !== null && rawTarget._id.equals(actorId))
      throw new AppError({
        status: 400,
        code: 'self_follow_forbidden',
        message: 'You cannot follow yourself.',
      });
    const target = await findPublicUser(username);
    // Upsert instead of create+catch(11000): correct even before the unique index has
    // finished its (async, post-connect) build, since it doesn't depend on the index —
    // only on the query-then-write semantics of upsert.
    await Follow.findOneAndUpdate(
      { followerId: actorId, followingId: target._id },
      { $setOnInsert: { followerId: actorId, followingId: target._id } },
      { upsert: true, setDefaultsOnInsert: true },
    );
  },

  async unfollow(actorId, username) {
    const target = await findPublicUser(username);
    await Follow.deleteOne({ followerId: actorId, followingId: target._id });
  },

  async like(actorId, collectionId) {
    const collection = await Collection.findById(collectionId);
    if (collection === null || collection.visibility !== 'public') throw collectionNotFound();
    // Upsert instead of create+catch(11000): correct even before the unique index has
    // finished its (async, post-connect) build. `rawResult` exposes whether this call
    // actually inserted, so the derived `likeCount` only increments once per user.
    const result = await CollectionLike.findOneAndUpdate(
      { userId: actorId, collectionId },
      { $setOnInsert: { userId: actorId, collectionId } },
      { upsert: true, setDefaultsOnInsert: true, rawResult: true },
    );
    if (result.lastErrorObject?.upserted !== undefined)
      await Collection.updateOne({ _id: collectionId }, { $inc: { likeCount: 1 } });
  },

  async unlike(actorId, collectionId) {
    const deleted = await CollectionLike.findOneAndDelete({ userId: actorId, collectionId });
    if (deleted !== null)
      await Collection.updateOne({ _id: collectionId }, { $inc: { likeCount: -1 } });
  },

  async getPublicProfile(username, viewerId) {
    const user = await findPublicUser(username);
    const [followerCount, followingCount, isFollowedByViewer] = await Promise.all([
      Follow.countDocuments({ followingId: user._id }),
      Follow.countDocuments({ followerId: user._id }),
      viewerId === undefined
        ? false
        : Follow.exists({ followerId: viewerId, followingId: user._id }).then(Boolean),
    ]);
    return toSocialProfileDto(user, { followerCount, followingCount, isFollowedByViewer });
  },

  async listFollowers(username) {
    const user = await findPublicUser(username);
    if (!user.social.showFollowers) return [];
    const follows = await Follow.find({ followingId: user._id }).populate('followerId', 'username');
    return follows.map(follow => follow.followerId.username);
  },

  async listFollowing(username) {
    const user = await findPublicUser(username);
    if (!user.social.showFollowing) return [];
    const follows = await Follow.find({ followerId: user._id }).populate('followingId', 'username');
    return follows.map(follow => follow.followingId.username);
  },

  /** Resolves a Collection for anonymous/public viewing by either its Mongo `_id` or its
   * `legacyPublicId` — the two identifier shapes a share link can carry — so old and new
   * links converge on the same lookup. Private Collections 404 like an unknown id. */
  async getPublicCollection(publicId, viewerId) {
    const collection = await Collection.findOne({
      $or: [{ _id: publicId }, { legacyPublicId: publicId }],
    }).populate('ownerId', 'username');
    if (collection === null || collection.visibility === 'private') throw collectionNotFound();
    const isLikedByViewer =
      viewerId === undefined
        ? false
        : await CollectionLike.exists({ userId: viewerId, collectionId: collection._id }).then(
            Boolean,
          );
    return {
      id: collection._id.toString(),
      ownerUsername: collection.ownerId.username,
      name: collection.name,
      description: collection.description,
      visibility: collection.visibility,
      cover: collection.cover,
      items: collection.items,
      itemCount: collection.items.length,
      likeCount: collection.likeCount,
      isLikedByViewer,
      createdAt: collection.createdAt,
    };
  },

  async discoverCollections({ sort, page, limit }) {
    const sortSpec = sort === 'popular' ? { likeCount: -1, createdAt: -1 } : { createdAt: -1 };
    const collections = await Collection.find({ visibility: 'public' })
      .sort(sortSpec)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('ownerId', 'username');
    return collections.map(collection => ({
      id: collection._id.toString(),
      ownerUsername: collection.ownerId.username,
      name: collection.name,
      description: collection.description,
      cover: collection.cover,
      itemCount: collection.items.length,
      likeCount: collection.likeCount,
      createdAt: collection.createdAt,
    }));
  },
};

export default SocialService;
