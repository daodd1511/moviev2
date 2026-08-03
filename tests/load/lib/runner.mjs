// Minimal, dependency-free load generator: fires `request()` at the given
// concurrency for `durationMs`, then checks p95 latency and error rate
// against documented thresholds. Exits the process with code 1 on failure
// so `pnpm load:test` fails loudly in CI/local runs without a separate
// assertion library.

const DEFAULT_API_BASE_URL = 'http://localhost:4000/api';

/**
 * Resolves the API base URL for a load test run.
 * Refuses non-localhost targets unless `ALLOW_REMOTE_LOAD_TEST=1` is set —
 * these scripts write real data (users, library entries, Collections) and
 * must run against a disposable local stack, not a shared or production API.
 */
export const resolveBaseUrl = () => {
  const baseUrl = process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL;
  const { hostname } = new URL(baseUrl);
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
  if (!isLocal && process.env.ALLOW_REMOTE_LOAD_TEST !== '1') {
    throw new Error(
      `Refusing to load-test non-local API_BASE_URL (${baseUrl}). ` +
        'Point it at a disposable local stack, or set ALLOW_REMOTE_LOAD_TEST=1 if you really mean it.',
    );
  }
  return baseUrl;
};

const percentile = (sortedMs, p) => {
  if (sortedMs.length === 0) return 0;
  const index = Math.min(sortedMs.length - 1, Math.floor(sortedMs.length * p));
  return sortedMs[index];
};

/**
 * Runs `request()` repeatedly across `concurrency` workers until `durationMs`
 * elapses, then reports p50/p95 latency and error rate against `thresholds`.
 *
 * @param {{
 *   name: string,
 *   concurrency: number,
 *   durationMs: number,
 *   thresholds: { p95Ms: number, errorRate: number },
 *   request: () => Promise<{ ok: boolean }>,
 * }} config
 * @returns {Promise<boolean>} whether the run met both thresholds
 */
export const runLoad = async ({ name, concurrency, durationMs, thresholds, request }) => {
  const latenciesMs = [];
  let total = 0;
  let errors = 0;
  const deadline = Date.now() + durationMs;

  const worker = async () => {
    while (Date.now() < deadline) {
      const start = performance.now();
      try {
        const { ok } = await request();
        if (!ok) errors += 1;
      } catch {
        errors += 1;
      }
      latenciesMs.push(performance.now() - start);
      total += 1;
    }
  };

  await Promise.all(Array.from({ length: concurrency }, worker));

  const sorted = [...latenciesMs].sort((a, b) => a - b);
  const p50 = percentile(sorted, 0.5);
  const p95 = percentile(sorted, 0.95);
  const errorRate = total === 0 ? 1 : errors / total;
  const pass = p95 <= thresholds.p95Ms && errorRate <= thresholds.errorRate;

  console.log(
    `[load:${name}] requests=${total} errors=${errors} errorRate=${(errorRate * 100).toFixed(2)}% ` +
      `p50=${p50.toFixed(0)}ms p95=${p95.toFixed(0)}ms ` +
      `(thresholds: p95<=${thresholds.p95Ms}ms errorRate<=${(thresholds.errorRate * 100).toFixed(1)}%) ` +
      `-> ${pass ? 'PASS' : 'FAIL'}`,
  );

  if (!pass) process.exitCode = 1;
  return pass;
};
