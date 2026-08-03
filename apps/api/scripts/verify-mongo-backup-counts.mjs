import { MongoClient } from 'mongodb';

/** Returns { [collectionName]: documentCount } for every collection in `uri`'s database. */
const countsByCollection = async uri => {
  const client = new MongoClient(uri);
  await client.connect();
  try {
    const db = client.db();
    const collections = await db.listCollections().toArray();
    const counts = {};
    for (const { name } of collections) {
      counts[name] = await db.collection(name).countDocuments();
    }
    return counts;
  } finally {
    await client.close();
  }
};

const [sourceUri, targetUri] = process.argv.slice(2);
if (!sourceUri || !targetUri) {
  console.error('Usage: verify-mongo-backup-counts.mjs <sourceUri> <targetUri>');
  process.exit(1);
}

const [sourceCounts, targetCounts] = await Promise.all([
  countsByCollection(sourceUri),
  countsByCollection(targetUri),
]);

const names = new Set([...Object.keys(sourceCounts), ...Object.keys(targetCounts)]);
let mismatches = 0;
for (const name of names) {
  const sourceCount = sourceCounts[name] ?? 0;
  const targetCount = targetCounts[name] ?? 0;
  const status = sourceCount === targetCount ? 'OK' : 'MISMATCH';
  if (status === 'MISMATCH') mismatches += 1;
  console.log(`${status} ${name}: source=${sourceCount} target=${targetCount}`);
}

if (mismatches > 0) {
  console.error(`${mismatches} collection(s) mismatched between source and restored target.`);
  process.exit(1);
}
console.log('Backup verified: restored counts match the source exactly.');
