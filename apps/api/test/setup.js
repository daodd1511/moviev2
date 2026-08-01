import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, afterEach, beforeAll } from 'vitest';
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/db.config.js';
import { logger } from '../src/logger.js';

logger.level = 'silent';

// Synthetic, never read from a developer .env — jwt.sign/verify need a TOKEN_KEY and
// tests must not depend on (or be able to touch) a real one.
process.env.TOKEN_KEY ??= 'test-only-token-key';

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await connectDatabase(mongod.getUri());
});

/** The disposable in-memory MongoDB's connection URI, for tests that need to
 * disconnect/reconnect deliberately (e.g. exercising `/ready`'s 503 path). */
export const getTestMongoUri = () => mongod.getUri();

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map(collection => collection.deleteMany({})));
});

afterAll(async () => {
  await disconnectDatabase();
  await mongod.stop();
});
