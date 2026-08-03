# Security

## Authentication

Passwords are hashed with bcrypt (`apps/api/src/service/authService.js`, cost factor 10) and never stored or logged in plaintext. On login, the API issues a JWT
(`jwt.sign({ id: user._id }, TOKEN_KEY, { expiresIn: '30d' })`) signed with
`TOKEN_KEY`. `apps/api/src/middleware/auth.middleware.js`'s `verifyToken` requires a
well-formed `Authorization: Bearer <token>` header on every protected route; a
missing header, wrong scheme, or invalid/expired token all fail identically, so a
response can't be used to distinguish "no token" from "bad token."

`AuthService.login` returns the same `invalid_credentials` error for both an unknown
username and a wrong password, so a login attempt can't be used to enumerate
registered usernames.

`/api/auth/register` and `/api/auth/login` are rate-limited to 10 requests per 15
minutes per client (`apps/api/src/router/auth.routes.js`). No other route is
rate-limited — see "Known gaps" below.

## Known risk: 30-day bearer token in `localStorage`

The web app stores the JWT in `localStorage` under the key `TOKENS`
(`apps/web/src/api/services/tokenService.ts`), attached to every non-auth request via
an Axios interceptor (`apps/web/src/api/interceptors/token.interceptor.ts`). Two
properties compound the risk:

- **30-day expiry.** A stolen token stays valid for up to 30 days — there is no
  shorter-lived access token plus refresh-token rotation.
- **`localStorage`, not an `httpOnly` cookie.** Any script that runs in the page's
  origin — most concretely a successful XSS injection — can read `localStorage` and
  exfiltrate the token. An `httpOnly` cookie would be inaccessible to JavaScript
  entirely, trading this risk for CSRF exposure instead (which would need its own
  mitigation, e.g. a `SameSite` policy plus a CSRF token).

**Mitigation in place today:** the API sends `helmet()`'s default header set,
including a `Content-Security-Policy` that restricts `script-src` to `'self'` — this
is the primary defense against the XSS that would make token theft possible. Zod
`.strict()` validation on every request body/query/params (see "Input validation"
below) closes off a large class of injection vectors that could otherwise reach a
reflected-XSS sink.

**Not yet mitigated:** there is no shorter access-token lifetime, no refresh-token
rotation, and no server-side token revocation (a compromised token cannot be
invalidated before its 30-day expiry short of rotating `TOKEN_KEY`, which invalidates
every session). Treat this as the standing highest-impact security follow-up for this
codebase.

## Transport and headers

`helmet()` is applied globally (`apps/api/src/app.js`), providing the standard
header set: CSP, `X-Content-Type-Options`, `X-Frame-Options`, HSTS, and friends.
`cors()` restricts cross-origin requests to `CORS_ORIGINS` (comma-separated,
defaults to `http://localhost:3000` for local dev). `express.json({ limit: '100kb' })`
caps request body size. `trust proxy` is set to exactly one hop, so `req.ip` (used for
rate limiting) reflects the real client through the platform's load balancer and
can't be spoofed by an arbitrary `X-Forwarded-For` chain.

## Input validation

Every route validates its `body`/`query`/`params` against a Zod schema via
`apps/api/src/middleware/validate.middleware.js`, and every object schema is
`.strict()` — an unrecognized field is rejected outright rather than silently
dropped or passed through.

## Secrets

`MONGO_URI` and `TOKEN_KEY` are runtime container environment variables, injected by
`docker-compose` from the deploy host's `.env` — never baked into a Docker image or
committed to source. The web build's `VITE_APP_*` build args are compiled into the
public browser bundle by design (the TMDB key is client-side) and are Actions
_variables_, not secrets — see the comment in `.github/workflows/build.yml`.

## Known gaps

- No general-purpose rate limiting beyond `/api/auth/*` — a determined actor can
  hammer any other authenticated or public route without a built-in backoff.
- No account lockout after repeated failed logins (the 10-req/15min limit is IP-based,
  not account-based).
- No CSP report-only rollout or violation reporting endpoint — CSP is enforced
  directly with no visibility into what it blocks in production.
- See `docs/privacy.md` for the data-exposure side of this codebase (what's public,
  what's private, and under what opt-in).
