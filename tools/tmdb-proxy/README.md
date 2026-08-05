# tmdb-proxy

A Cloudflare Worker that forwards requests to TMDB's v3 API unchanged.

## Why this exists

Some networks block `api.themoviedb.org` with poisoned DNS (the name resolves to
`127.0.0.1`) plus a TLS reset triggered by the SNI, so the connection dies even
when pointed at a correct TMDB IP. The API reports this as
`502 catalog_unavailable`, because `fetch` throws and
`apps/api/src/catalog/tmdbCatalogProvider.js` maps a thrown request onto that
error.

DNS-level fixes alone (DoH, `1.1.1.1`, an `/etc/hosts` pin) do **not** help — they
resolve the address correctly and the TLS reset still kills the connection.
Cloudflare stays reachable on those networks, so proxying through a Worker
restores catalog requests without a VPN.

Only `api.themoviedb.org` and `www.themoviedb.org` are affected. `image.tmdb.org`
is reachable, so posters load regardless of this proxy.

## Deploy

From this directory, using your own Cloudflare account:

```sh
npx wrangler login
npx wrangler deploy
```

`wrangler` prints the deployed URL, e.g. `https://tmdb-proxy.<subdomain>.workers.dev`.

## Point the API at it

Set `TMDB_BASE_URL` in `apps/api/.env`, keeping the `/3` suffix so the path
matches TMDB's own base URL:

```sh
TMDB_BASE_URL=https://tmdb-proxy.<subdomain>.workers.dev/3
```

Restart the API. Leave `TMDB_API_KEY` set — the API still refuses to start
catalog requests without it, and the key is what the proxy forwards upstream.

Unset `TMDB_BASE_URL` to go back to calling TMDB directly.

## Optional: lock the proxy down

Without a secret the Worker is a public, unauthenticated pass-through to TMDB.
It cannot leak your API key — callers must supply their own, and TMDB rejects
requests without one — but anyone who learns the URL can spend your Worker
request quota.

The API's TMDB client only accepts a base URL and cannot send custom headers, so
the shared secret goes in the path instead:

```sh
npx wrangler secret put PROXY_SECRET   # enter a long random string
```

Then include it in the base URL, ahead of the `/3`:

```sh
TMDB_BASE_URL=https://tmdb-proxy.<subdomain>.workers.dev/<secret>/3
```

Requests missing the prefix get a 404.

## Security notes

- The TMDB API key travels as a query parameter, so it appears in Cloudflare's
  request logs for this Worker. That is your own account, but it is a copy of the
  key outside your machine — rotate it if the Worker is ever shared.
- Only point `TMDB_BASE_URL` at a proxy you control. Any host configured there
  receives your API key.
- The Worker accepts `GET` only, which is all the catalog provider issues.
