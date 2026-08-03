// Load test: GET /api/catalog/discover (public, no auth).
// Threshold rationale: this endpoint proxies TMDB, so p95 is set looser than
// the app's own read paths, and the error-rate allowance covers occasional
// upstream TMDB throttling rather than app-level regressions.
import { resolveBaseUrl, runLoad } from './lib/runner.mjs';

const baseUrl = resolveBaseUrl();

const pass = await runLoad({
  name: 'catalog-discover',
  concurrency: 10,
  durationMs: 10_000,
  thresholds: { p95Ms: 1500, errorRate: 0.05 },
  request: async () => {
    const page = 1 + Math.floor(Math.random() * 5);
    const response = await fetch(`${baseUrl}/catalog/discover?mediaType=movie&page=${page}`);
    return { ok: response.ok };
  },
});

if (!pass) process.exitCode = 1;
