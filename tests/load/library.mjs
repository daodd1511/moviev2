// Load test: PUT /api/library/entries (authenticated upsert).
// Authenticates exactly once (register + login), then hammers upsert with a
// unique synthetic tmdbId per request — upsert has no optimistic-lock
// conflict to serialize on, so this exercises real write concurrency.
import { resolveBaseUrl, runLoad } from './lib/runner.mjs';
import { createSyntheticUser, syntheticMediaSnapshot } from './lib/client.mjs';

const baseUrl = resolveBaseUrl();
const { authHeader } = await createSyntheticUser(baseUrl);

let nextTmdbId = 1;

const pass = await runLoad({
  name: 'library-upsert',
  concurrency: 10,
  durationMs: 10_000,
  thresholds: { p95Ms: 500, errorRate: 0.01 },
  request: async () => {
    const tmdbId = nextTmdbId++;
    const response = await fetch(`${baseUrl}/library/entries`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({
        mediaType: 'movie',
        tmdbId,
        watchState: 'planned',
        mediaSnapshot: syntheticMediaSnapshot(tmdbId),
      }),
    });
    return { ok: response.ok };
  },
});

if (!pass) process.exitCode = 1;
