// Shared helpers for load scripts that need an authenticated synthetic user.
// `/api/auth/register` and `/api/auth/login` are rate-limited to 10 requests
// per 15 minutes (apps/api/src/router/auth.routes.js), so each load script
// must authenticate exactly once — one register + one login — and reuse the
// resulting token for the whole run.

export const randomSuffix = () => Math.random().toString(36).slice(2, 10);

/**
 * Registers and logs in a throwaway user, returning a bearer token for
 * authenticated load requests. Synthetic data only — never point this at a
 * shared or production API (see `resolveBaseUrl` in `runner.mjs`).
 */
export const createSyntheticUser = async baseUrl => {
  const suffix = randomSuffix();
  const username = `loadtest_${suffix}`;
  const email = `loadtest_${suffix}@example.test`;
  const password = 'Load-test-password-1';

  const registerResponse = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, first_name: null, last_name: null }),
  });
  if (!registerResponse.ok) {
    throw new Error(`Synthetic user registration failed: ${registerResponse.status}`);
  }

  const loginResponse = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!loginResponse.ok) {
    throw new Error(`Synthetic user login failed: ${loginResponse.status}`);
  }
  const { accessToken } = await loginResponse.json();
  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    throw new Error('Synthetic user login did not return an accessToken.');
  }
  return { username, authHeader: { Authorization: `Bearer ${accessToken}` } };
};

export const syntheticMediaSnapshot = tmdbId => ({
  title: `Load Test Title ${tmdbId}`,
  posterPath: null,
  releaseDate: '2020-01-01',
  voteAverage: 5,
});
