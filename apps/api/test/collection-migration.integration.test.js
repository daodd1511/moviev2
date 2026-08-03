import { describe, expect, it } from 'vitest';

import Collection from '../src/model/collection.js';
import CollectionCompatibilityService from '../src/service/collectionCompatibilityService.js';
import User from '../src/model/user.js';
import { migrateLegacyListsToCollections } from '../scripts/migrate-lists-to-collections.js';
import { buildMedia, createUser } from './helpers/factories.js';

const addLegacyList = async (user, overrides = {}) => {
  const list = {
    name: 'Legacy list',
    description: 'Kept for rollback',
    movies: [buildMedia({ type: 'movie' })],
    tvShows: [buildMedia({ type: 'tv' })],
    ...overrides,
  };
  user.lists.push(list);
  await user.save();
  return user.lists.at(-1);
};

describe('legacy list migration', () => {
  it('audits dry runs, migrates idempotently, preserves public IDs, ordering, and legacy data', async () => {
    const { user } = await createUser();
    const legacyList = await addLegacyList(user);

    const audit = await migrateLegacyListsToCollections({ dryRun: true });
    expect(audit).toMatchObject({ mode: 'dry-run', scanned: 1, wouldCreate: 1, created: 0 });
    expect(audit.sample[0]).toMatchObject({
      legacyPublicId: legacyList._id.toString(),
      visibility: 'unlisted',
      itemKeys: [`movie:${legacyList.movies[0].id}`, `tv:${legacyList.tvShows[0].id}`],
    });
    expect(await Collection.countDocuments()).toBe(0);

    const executed = await migrateLegacyListsToCollections({ dryRun: false });
    expect(executed).toMatchObject({ mode: 'execute', created: 1, wouldCreate: 1 });
    const collection = await Collection.findOne({ legacyPublicId: legacyList._id.toString() });
    expect(collection).not.toBeNull();
    expect(collection.visibility).toBe('unlisted');
    expect(collection.toObject().collaborators).toEqual([{ userId: user._id, role: 'owner' }]);
    expect(collection.items.map(item => `${item.mediaType}:${item.tmdbId}`)).toEqual([
      `movie:${legacyList.movies[0].id}`,
      `tv:${legacyList.tvShows[0].id}`,
    ]);

    const rerun = await migrateLegacyListsToCollections({ dryRun: false });
    expect(rerun).toMatchObject({ created: 0, alreadyMigrated: 1 });
    const reloadedUser = await User.findById(user._id);
    expect(reloadedUser.lists).toHaveLength(1);
    expect(reloadedUser.lists[0]._id.toString()).toBe(legacyList._id.toString());
  });

  it('resumes after a user cursor and dual-reads legacy then canonical data', async () => {
    const { user: firstUser } = await createUser();
    const firstList = await addLegacyList(firstUser, { name: 'First' });
    const { user: secondUser } = await createUser();
    const secondList = await addLegacyList(secondUser, { name: 'Second' });

    const legacy = await CollectionCompatibilityService.getLegacyPublic(
      firstUser.username,
      firstList._id.toString(),
    );
    expect(legacy.source).toBe('legacy');

    const resumed = await migrateLegacyListsToCollections({
      dryRun: false,
      afterId: firstUser._id.toString(),
    });
    expect(resumed).toMatchObject({ created: 1, nextAfterId: secondUser._id.toString() });
    expect(await Collection.findOne({ legacyPublicId: firstList._id.toString() })).toBeNull();
    const canonical = await CollectionCompatibilityService.getLegacyPublic(
      secondUser.username,
      secondList._id.toString(),
    );
    expect(canonical.source).toBe('collection');
  });

  it('blocks execution when another owner already occupies a legacy public ID', async () => {
    const { user } = await createUser();
    const legacyList = await addLegacyList(user);
    const { user: otherUser } = await createUser();
    await Collection.create({
      ownerId: otherUser._id,
      name: 'Collision',
      visibility: 'unlisted',
      legacyPublicId: legacyList._id.toString(),
      collaborators: [{ userId: otherUser._id, role: 'owner' }],
    });

    await expect(migrateLegacyListsToCollections({ dryRun: false })).rejects.toThrow('collision');
    expect(await Collection.countDocuments()).toBe(1);
  });
});
