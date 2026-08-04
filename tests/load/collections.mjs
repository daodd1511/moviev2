// Load test: Collection reads (authenticated), the dominant traffic shape
// for Collection pages and public discovery. Concurrent writes to the same
// Collection are deliberately excluded — optimistic-version conflicts there
// are correct concurrency control, not a load-capacity signal — so this
// seeds a handful of items sequentially, then load-tests GET /collections/:id
// and GET /collections concurrently.
import { resolveBaseUrl, runLoad } from './lib/runner.mjs';
import { createSyntheticUser, syntheticMediaSnapshot } from './lib/client.mjs';

const baseUrl = resolveBaseUrl();
const { authHeader } = await createSyntheticUser(baseUrl);

const createResponse = await fetch(`${baseUrl}/collections`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...authHeader },
  body: JSON.stringify({ name: 'Load test collection', visibility: 'private', items: [] }),
});
if (!createResponse.ok) {
  throw new Error(`Failed to seed load-test collection: ${createResponse.status}`);
}
const collection = await createResponse.json();
let { version } = collection;

for (let tmdbId = 1; tmdbId <= 20; tmdbId += 1) {
  const addResponse = await fetch(`${baseUrl}/collections/${collection.id}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader },
    body: JSON.stringify({
      item: { mediaType: 'movie', tmdbId, ...syntheticMediaSnapshot(tmdbId) },
      version,
    }),
  });
  if (!addResponse.ok) {
    throw new Error(`Failed to seed load-test collection item: ${addResponse.status}`);
  }
  ({ version } = await addResponse.json());
}

const pass = await runLoad({
  name: 'collections-read',
  concurrency: 15,
  durationMs: 10_000,
  thresholds: { p95Ms: 400, errorRate: 0.01 },
  request: async () => {
    const url =
      Math.random() < 0.5 ? `${baseUrl}/collections` : `${baseUrl}/collections/${collection.id}`;
    const response = await fetch(url, { headers: authHeader });
    return { ok: response.ok };
  },
});

if (!pass) process.exitCode = 1;
