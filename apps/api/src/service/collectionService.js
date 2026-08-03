import Collection from '../model/collection.js';
import { AppError } from '../errors/app-error.js';

const notFound = () =>
  new AppError({ status: 404, code: 'collection_not_found', message: 'Collection not found.' });
const conflict = () =>
  new AppError({
    status: 409,
    code: 'collection_version_conflict',
    message: 'This Collection changed. Reload and try again.',
  });
const sameItem = (left, right) =>
  left.mediaType === right.mediaType && left.tmdbId === right.tmdbId;

const ownerFilter = (ownerId, id) => ({ _id: id, ownerId });
const versionedOwnerFilter = (ownerId, id, version) => ({ ...ownerFilter(ownerId, id), version });

const ownedOrThrow = async (ownerId, id) => {
  const collection = await Collection.findOne(ownerFilter(ownerId, id));
  if (collection === null) throw notFound();
  return collection;
};

const CollectionService = {
  async listForUser(userId) {
    return Collection.find({ $or: [{ ownerId: userId }, { 'collaborators.userId': userId }] }).sort(
      { updatedAt: -1 },
    );
  },

  async getAccessible(viewerId, id) {
    const collection = await Collection.findById(id);
    if (collection === null) throw notFound();
    const isCollaborator =
      viewerId !== undefined && collection.collaborators.some(item => item.userId.equals(viewerId));
    if (collection.visibility === 'private' && !isCollaborator) throw notFound();
    return collection;
  },

  async create(ownerId, input) {
    return Collection.create({
      ownerId,
      name: input.name,
      description: input.description ?? null,
      visibility: input.visibility,
      items: input.items,
      cover: input.cover,
      collaborators: [{ userId: ownerId, role: 'owner' }],
    });
  },

  async update(ownerId, id, input, version) {
    const collection = await Collection.findOneAndUpdate(
      versionedOwnerFilter(ownerId, id, version),
      { $set: input, $inc: { version: 1 } },
      { new: true, runValidators: true },
    );
    if (collection !== null) return collection;
    await ownedOrThrow(ownerId, id);
    throw conflict();
  },

  async addItem(ownerId, id, item, version) {
    const collection = await Collection.findOneAndUpdate(
      {
        ...versionedOwnerFilter(ownerId, id, version),
        items: { $not: { $elemMatch: { mediaType: item.mediaType, tmdbId: item.tmdbId } } },
      },
      { $push: { items: item }, $inc: { version: 1 } },
      { new: true, runValidators: true },
    );
    if (collection !== null) return collection;
    const current = await ownedOrThrow(ownerId, id);
    if (current.version !== version) throw conflict();
    throw new AppError({
      status: 409,
      code: 'collection_item_exists',
      message: 'This title is already in the Collection.',
    });
  },

  async removeItem(ownerId, id, itemKey, version) {
    const collection = await Collection.findOneAndUpdate(
      { ...versionedOwnerFilter(ownerId, id, version), items: { $elemMatch: itemKey } },
      { $pull: { items: itemKey }, $inc: { version: 1 } },
      { new: true },
    );
    if (collection !== null) return collection;
    const current = await ownedOrThrow(ownerId, id);
    if (current.version !== version) throw conflict();
    throw new AppError({
      status: 404,
      code: 'collection_item_not_found',
      message: 'Collection item not found.',
    });
  },

  async reorderItems(ownerId, id, itemKeys, version) {
    const current = await ownedOrThrow(ownerId, id);
    if (current.version !== version) throw conflict();
    if (
      itemKeys.length !== current.items.length ||
      itemKeys.some(key => !current.items.some(item => sameItem(item, key)))
    ) {
      throw new AppError({
        status: 400,
        code: 'collection_order_invalid',
        message: 'Order must contain every Collection item exactly once.',
      });
    }
    const orderedItems = itemKeys.map(key => current.items.find(item => sameItem(item, key)));
    const collection = await Collection.findOneAndUpdate(
      versionedOwnerFilter(ownerId, id, version),
      { $set: { items: orderedItems }, $inc: { version: 1 } },
      { new: true, runValidators: true },
    );
    if (collection !== null) return collection;
    throw conflict();
  },

  async duplicate(ownerId, id) {
    const source = await this.getAccessible(ownerId, id);
    return Collection.create({
      ownerId,
      name: `${source.name} (copy)`,
      description: source.description,
      visibility: 'private',
      items: source.items.map(item => item.toObject()),
      cover: source.cover?.toObject() ?? null,
      collaborators: [{ userId: ownerId, role: 'owner' }],
    });
  },

  async remove(ownerId, id, version) {
    const collection = await Collection.findOneAndDelete(
      versionedOwnerFilter(ownerId, id, version),
    );
    if (collection !== null) return;
    await ownedOrThrow(ownerId, id);
    throw conflict();
  },
};

export default CollectionService;
