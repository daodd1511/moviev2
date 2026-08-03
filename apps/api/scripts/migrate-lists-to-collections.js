import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { connectDatabase, disconnectDatabase } from '../src/config/db.config.js';
import Collection from '../src/model/collection.js';
import User from '../src/model/user.js';

const toCollectionItem = (media, mediaType) => ({
  mediaType,
  tmdbId: media.id,
  title: media.title,
  posterPath: media.posterPath,
  releaseDate: media.releaseDate,
  voteAverage: media.voteAverage,
});

const toCollection = (ownerId, list) => ({
  ownerId,
  name: list.name,
  description: list.description ?? null,
  visibility: 'unlisted',
  legacyPublicId: list._id.toString(),
  collaborators: [{ userId: ownerId, role: 'owner' }],
  items: [
    ...list.movies.map(media => toCollectionItem(media, 'movie')),
    ...list.tvShows.map(media => toCollectionItem(media, 'tv')),
  ],
});

const parseArgs = args => ({
  dryRun: !args.includes('--execute'),
  afterId: args.find(arg => arg.startsWith('--after-id='))?.slice('--after-id='.length),
  sampleSize: Number(
    args.find(arg => arg.startsWith('--sample-size='))?.slice('--sample-size='.length) ?? 5,
  ),
});

const validateOptions = ({ afterId, sampleSize }) => {
  if (afterId !== undefined && !mongoose.isObjectIdOrHexString(afterId)) {
    throw new Error('--after-id must be a Mongo ObjectId.');
  }
  if (!Number.isInteger(sampleSize) || sampleSize < 1 || sampleSize > 100) {
    throw new Error('--sample-size must be an integer between 1 and 100.');
  }
};

const findLegacyLists = async afterId => {
  const filter = { 'lists.0': { $exists: true } };
  if (afterId !== undefined) filter._id = { $gt: afterId };
  const users = await User.find(filter).sort({ _id: 1 }).lean();
  return users.flatMap(user => user.lists.map(list => ({ ownerId: user._id, list })));
};

const findCollisions = async candidates => {
  const legacyIds = candidates.map(candidate => candidate.list._id.toString());
  const existing = await Collection.find({ legacyPublicId: { $in: legacyIds } }).lean();
  const byLegacyId = new Map(existing.map(collection => [collection.legacyPublicId, collection]));
  return candidates.filter(candidate => {
    const existingCollection = byLegacyId.get(candidate.list._id.toString());
    return (
      existingCollection !== undefined && !existingCollection.ownerId.equals(candidate.ownerId)
    );
  });
};

/**
 * Converts embedded legacy lists into canonical Collections without modifying User documents.
 * Pass `dryRun: true` to inspect the deterministic cursor segment before any write.
 */
export const migrateLegacyListsToCollections = async (options = {}) => {
  const config = { dryRun: true, afterId: undefined, sampleSize: 5, ...options };
  validateOptions(config);
  const candidates = await findLegacyLists(config.afterId);
  const collisions = await findCollisions(candidates);
  if (collisions.length > 0) {
    throw new Error(`Migration blocked: ${collisions.length} legacy ID collision(s) found.`);
  }

  const existingIds = new Set(
    (
      await Collection.find(
        { legacyPublicId: { $in: candidates.map(candidate => candidate.list._id.toString()) } },
        { legacyPublicId: 1 },
      ).lean()
    ).map(collection => collection.legacyPublicId),
  );
  const pending = candidates.filter(candidate => !existingIds.has(candidate.list._id.toString()));
  if (!config.dryRun && pending.length > 0) {
    await Collection.insertMany(
      pending.map(candidate => toCollection(candidate.ownerId, candidate.list)),
    );
  }

  const sample = pending.slice(0, config.sampleSize).map(candidate => {
    const collection = toCollection(candidate.ownerId, candidate.list);
    return {
      legacyPublicId: collection.legacyPublicId,
      name: collection.name,
      visibility: collection.visibility,
      itemCount: collection.items.length,
      itemKeys: collection.items.map(item => `${item.mediaType}:${item.tmdbId}`),
    };
  });
  return {
    mode: config.dryRun ? 'dry-run' : 'execute',
    afterId: config.afterId ?? null,
    nextAfterId: candidates.at(-1)?.ownerId.toString() ?? null,
    scanned: candidates.length,
    alreadyMigrated: candidates.length - pending.length,
    created: config.dryRun ? 0 : pending.length,
    wouldCreate: pending.length,
    collisions: 0,
    sample,
  };
};

const main = async () => {
  dotenv.config();
  if (process.env.MONGO_URI === undefined) throw new Error('MONGO_URI is required.');
  const options = parseArgs(process.argv.slice(2));
  await connectDatabase(process.env.MONGO_URI);
  try {
    console.log(JSON.stringify(await migrateLegacyListsToCollections(options), null, 2));
  } finally {
    await disconnectDatabase();
  }
};

if (
  process.argv[1] !== undefined &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
