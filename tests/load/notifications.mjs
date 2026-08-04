// Load test: GET /api/notifications (authenticated list read) — the
// endpoint polled most frequently by the notification bell in the web app.
import { resolveBaseUrl, runLoad } from './lib/runner.mjs';
import { createSyntheticUser } from './lib/client.mjs';

const baseUrl = resolveBaseUrl();
const { authHeader } = await createSyntheticUser(baseUrl);

const pass = await runLoad({
  name: 'notifications-list',
  concurrency: 15,
  durationMs: 10_000,
  thresholds: { p95Ms: 400, errorRate: 0.01 },
  request: async () => {
    const response = await fetch(`${baseUrl}/notifications`, { headers: authHeader });
    return { ok: response.ok };
  },
});

if (!pass) process.exitCode = 1;
