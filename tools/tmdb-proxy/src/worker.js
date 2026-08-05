/**
 * Cloudflare Worker that transparently proxies TMDB's v3 API.
 *
 * Exists because some networks block `api.themoviedb.org` outright (poisoned DNS
 * plus an SNI-triggered TLS reset), which surfaces in this project as every
 * `/api/catalog` request failing with `502 catalog_unavailable`. Cloudflare
 * remains reachable on those networks, so routing TMDB calls through a Worker
 * restores the API without a VPN.
 *
 * The incoming path and query string are forwarded verbatim to TMDB, so a
 * request to `https://<worker>/3/movie/popular?api_key=…` becomes
 * `https://api.themoviedb.org/3/movie/popular?api_key=…`. Point the API's
 * `TMDB_BASE_URL` at `https://<worker>/3` and no application code changes.
 *
 * The upstream status code, `content-type`, and `retry-after` are preserved so
 * the API's existing 429 / 5xx handling in `tmdbCatalogProvider.js` keeps working.
 */

const TMDB_ORIGIN = 'https://api.themoviedb.org';

/**
 * Strips the optional shared-secret prefix from a request path.
 *
 * The secret lives in the path rather than a header because the API's TMDB
 * client only ever sets a base URL — it cannot attach custom headers. Returns
 * `null` when a secret is configured and the path does not carry it, which the
 * caller turns into a 404.
 *
 * @param {string} pathname Request path, e.g. `/s3cr3t/3/movie/popular`.
 * @param {string | undefined} secret Configured secret, if any.
 * @returns {string | null} Path to forward upstream, or `null` to reject.
 */
const stripSecretPrefix = (pathname, secret) => {
  if (!secret) return pathname;
  const prefix = `/${secret}`;
  if (pathname === prefix) return '/';
  if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  return null;
};

export default {
  /**
   * @param {Request} request
   * @param {{ PROXY_SECRET?: string }} env
   * @returns {Promise<Response>}
   */
  async fetch(request, env) {
    // The catalog provider only issues GETs; refusing everything else keeps the
    // Worker from being repurposed as a general-purpose open proxy.
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(request.url);
    const path = stripSecretPrefix(url.pathname, env.PROXY_SECRET);
    if (path === null) {
      return new Response('Not Found', { status: 404 });
    }

    const upstream = new URL(`${path}${url.search}`, TMDB_ORIGIN);

    let response;
    try {
      response = await fetch(upstream, {
        method: 'GET',
        headers: { accept: 'application/json' },
      });
    } catch {
      // Surface an unreachable upstream as a gateway error rather than a Worker
      // exception, so the API maps it onto its existing catalog_unavailable path.
      return new Response('Bad Gateway', { status: 502 });
    }

    const headers = new Headers();
    const contentType = response.headers.get('content-type');
    if (contentType !== null) headers.set('content-type', contentType);
    const retryAfter = response.headers.get('retry-after');
    if (retryAfter !== null) headers.set('retry-after', retryAfter);

    return new Response(response.body, { status: response.status, headers });
  },
};
