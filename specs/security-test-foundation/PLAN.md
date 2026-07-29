# Security and Test Foundation Plan

Written 2026-07-29 for the `moviev2` repository.

Parent roadmap:
[`../product-capability-roadmap/PLAN.md`](../product-capability-roadmap/PLAN.md),
Phase 0.

## Outcome

Establish the security, test, and observability foundation required before
session, account, Library, Collection, notification, or social expansion:

- close the cross-account update vulnerability;
- prevent password and internal-field disclosure;
- validate every active backend route at the API boundary;
- return stable error responses;
- add request IDs, structured logging, health, and readiness probes;
- replace the failing API test placeholder with executable API and web suites;
- add anonymous-browse and mocked-login browser smoke tests;
- make all automated checks authoritative in pull-request CI.

## Non-goals

- refresh-token cookies or session rotation;
- email verification, password reset, or account deletion;
- the Library, Collection migration, discovery, notification, collaboration,
  or social models;
- migrating the Express API to TypeScript;
- proxying existing TMDB traffic through the backend;
- selecting an external error-reporting vendor.

## Decisions

### Vitest is the workspace test runner

Use Vitest for API, web, and shared unit/integration tests. Add Supertest for
HTTP assertions, React Testing Library for components, MSW for client-network
tests, and `mongodb-memory-server` for disposable MongoDB integration tests.

Playwright remains a separate browser-smoke lane.

### Split app construction from process startup

`apps/api/src/app.js` exports:

```js
export const createApp = ({ logger } = {}) => Express.Application;
```

The factory installs middleware and routes without connecting to MongoDB or
opening a port. `apps/api/index.js` loads environment variables, awaits
`connectDatabase`, calls `createApp`, and opens the HTTP listener.

`apps/api/src/config/db.config.js` exports:

```js
export const connectDatabase = async uri => Promise<void>
export const disconnectDatabase = async () => Promise<void>
export const getDatabaseState = () => number
```

No imported module may call `process.exit`. Startup failure is handled only by
`index.js`.

### Standardize API errors

All API failures use:

```json
{
  "error": {
    "code": "stable_machine_code",
    "message": "Safe user-facing message",
    "requestId": "request identifier",
    "details": []
  }
}
```

`details` is optional and contains validation issues only. Production
responses never expose stacks, Mongo errors, JWT errors, or submitted
credentials.

`apps/api/src/errors/app-error.js` exports:

```js
export class AppError extends Error {
  constructor({ status, code, message, details, cause })
}
```

`apps/api/src/middleware/error.middleware.js` exports:

```js
export const notFoundHandler;
export const errorHandler;
```

### Validate before controllers

Use Zod schemas and one middleware:

```js
export const validate = ({ params, query, body }) => Express.RequestHandler;
```

Create:

- `apps/api/src/validation/auth.schema.js`
- `apps/api/src/validation/user.schema.js`
- `apps/api/src/validation/list.schema.js`

Validate registration, login, profile update, list identifiers, public-list
identifiers, list create/update, and media add/remove payloads.

Mongo IDs use a reusable 24-hex-character schema. User-facing strings are
trimmed and length-bounded. Unknown object keys are rejected.

### Derive account ownership from authentication

Replace `PUT /api/user/update/:id` with `PUT /api/user/profile`. The controller
passes only `req.userId` to the service. No authenticated account mutation
accepts a target user ID from the URL or body.

`UserService.updateProfile(userId, input)` permits only the current profile
fields already stored by the User model; password changes remain out of scope.

### Return public DTOs

`apps/api/src/dto/user.dto.js` exports:

```js
export const toPublicUser = user => ({
  id,
  username,
  email,
  firstName,
  lastName,
  phone,
  gender,
});
```

Registration and profile endpoints return only this DTO. Login continues to
return `{ id, accessToken }` until the account-lifecycle spec replaces the
session model.

### Harden the active HTTP surface

- JSON body limit: `100kb`.
- CORS allowlist: comma-separated `CORS_ORIGINS`; local development defaults
  to `http://localhost:3000`.
- Auth rate limit: 10 requests per 15 minutes per client IP on register and
  login routes.
- Helmet remains enabled.
- Bearer parsing rejects missing schemes, non-Bearer schemes, and empty tokens.
- JWT verification maps all failures to `401 unauthorized`.
- Use `DELETE /api/list` for clearing all legacy lists.
- Use `DELETE /api/list/:id/items` for clearing a legacy list's contents.
- Remove the state-changing `GET /api/list/clear` and
  `GET /api/list/:id/clear` routes.

The later Collections spec replaces the legacy list API; this phase secures
the behavior without redesigning it.

### Structured logs are the initial error-reporting sink

Use Pino and `pino-http`. `apps/api/src/logger.js` exports `logger`.

The request-ID middleware accepts a syntactically safe `x-request-id` or
generates a UUID, stores it on `req.id`, returns it in the response header,
and includes it in logs and error responses.

Add:

- `GET /health`: process liveness, no database dependency;
- `GET /ready`: `200` only while Mongoose is connected, otherwise `503`.

The web adds `apps/web/src/shared/components/AppErrorBoundary.tsx`. It renders
a safe retry/reload state and reports caught errors through
`apps/web/src/shared/utils/reportError.ts`, whose initial sink is structured
`console.error`. Vendor telemetry remains replaceable and out of scope.

Logs must redact authorization, cookie, password, token, and reset/verification
fields.

### API tests use a real disposable MongoDB

`apps/api/test/setup.js` starts one `MongoMemoryServer`, connects before tests,
clears collections between tests, and disconnects/stops after the suite.

Use synthetic fixtures only. Tests never read developer `.env` files or use a
live MongoDB URI.

### Browser smoke tests mock remote dependencies

Playwright starts the local Vite app and intercepts backend/TMDB calls needed
by each scenario. API correctness remains covered by Supertest integration
tests. Browser smoke tests verify routing and UI behavior without production
credentials or live services.

## Package and script changes

### Root `package.json`

Add:

```json
{
  "scripts": {
    "test": "pnpm test:unit",
    "test:unit": "vitest run",
    "test:api": "vitest run --project api",
    "test:web": "vitest run --project web",
    "test:e2e": "playwright test",
    "test:e2e:install": "playwright install --with-deps chromium",
    "check:api": "find apps/api -name '*.js' -not -path '*/node_modules/*' -exec node --check {} \\;"
  }
}
```

Add root dev dependencies:

- `vitest`
- `@vitest/coverage-v8`
- `supertest`
- `mongodb-memory-server`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jsdom`
- `msw`
- `@playwright/test`

Add `vitest.workspace.ts` with `api` and `web` projects, plus
`playwright.config.ts`.

### API package

Replace the placeholder test script with
`vitest run --project api`. Add runtime dependencies:

- `zod`
- `express-rate-limit`
- `pino`
- `pino-http`

Move `nodemon` to API dev dependencies.

### Web package

Add `test` as `vitest run --project web`.
Configure the web Vitest project for `jsdom` and
`apps/web/src/test/setup.ts`.

## API changes

### Application and middleware

Create or change:

- `apps/api/index.js`
- `apps/api/src/app.js`
- `apps/api/src/logger.js`
- `apps/api/src/config/db.config.js`
- `apps/api/src/errors/app-error.js`
- `apps/api/src/middleware/request-id.middleware.js`
- `apps/api/src/middleware/validate.middleware.js`
- `apps/api/src/middleware/error.middleware.js`
- `apps/api/src/middleware/auth.middleware.js`
- `apps/api/src/router/router.js`

Middleware order:

1. request ID and structured request logging;
2. Helmet and CORS;
3. JSON parsing with limit;
4. health/readiness routes;
5. `/api` routes;
6. not-found handler;
7. error handler.

### Authentication

Change:

- `apps/api/src/router/auth.routes.js`
- `apps/api/src/controller/auth.controller.js`
- `apps/api/src/service/authService.js`
- `apps/api/src/validation/auth.schema.js`
- `apps/api/src/dto/user.dto.js`

Controllers await services and call `next(error)`. Services accept data and
return values; they do not receive Express request/response objects.

Service interface:

```js
AuthService.register(input) => Promise<PublicUser>
AuthService.login(input) => Promise<{ id, accessToken }>
```

### Account profile

Change:

- `apps/api/src/router/user.routes.js`
- `apps/api/src/controller/user.controller.js`
- `apps/api/src/service/userService.js`
- `apps/api/src/validation/user.schema.js`

Active profile endpoints:

- `GET /api/user/profile`
- `PUT /api/user/profile`

Both derive identity from `verifyToken`.

Service interface:

```js
UserService.getUserById(userId) => Promise<UserDocument | null>
UserService.getUserByUsername(username) => Promise<UserDocument | null>
UserService.updateProfile(userId, input) => Promise<PublicUser>
```

### Legacy lists

Change:

- `apps/api/src/router/list.routes.js`
- `apps/api/src/controller/list.controller.js`
- `apps/api/src/service/listService.js`
- `apps/api/src/validation/list.schema.js`

Preserve owner-scoped CRUD, media add/remove, and public-link reads. Replace
state-changing GET routes as decided above.

Preserved service interface:

```js
ListService.getAll(userId);
ListService.getListById(userId, listId);
ListService.getListByUsername(username, listId);
ListService.create(userId, input);
ListService.update(userId, listId, input);
ListService.delete(userId, listId);
ListService.addMovie(userId, listId, media);
ListService.removeMovie(userId, listId, media);
ListService.addTv(userId, listId, media);
ListService.removeTv(userId, listId, media);
ListService.clear(userId, listId);
ListService.clearAll(userId);
```

## Web changes

### Test support

Create:

- `apps/web/src/test/setup.ts`
- `apps/web/src/test/renderApp.tsx`
- `apps/web/src/test/server.ts`
- `apps/web/src/test/handlers.ts`

`renderApp` installs QueryClient, Jotai, and router providers with isolated
state per test.

### Resilience coverage

Create tests beside:

- `apps/web/src/routes/guards/AuthGuard.test.tsx`
- `apps/web/src/routes/guards/NoAuthGuard.test.tsx`
- `apps/web/src/api/interceptors/token.interceptor.test.ts`
- `apps/web/src/shared/components/List/Menu.test.tsx`
- `apps/web/src/features/Auth/components/LoginForm/LoginForm.test.tsx`

Add:

- `apps/web/src/shared/components/AppErrorBoundary.tsx`
- `apps/web/src/shared/components/AppErrorBoundary.test.tsx`
- `apps/web/src/shared/utils/reportError.ts`
- `apps/web/src/shared/utils/reportError.test.ts`

Update `apps/web/src/App.tsx` to wrap route rendering in the error boundary.

Tests cover:

- authenticated and anonymous route-guard decisions;
- safe login redirect handling;
- token attachment and unauthorized-token cleanup;
- list mutation success and failure feedback;
- safe fallback rendering and retry/reload behavior.

This phase does not replace the existing local-storage session model.

## API test inventory

Create:

- `apps/api/test/setup.js`
- `apps/api/test/helpers/factories.js`
- `apps/api/test/helpers/auth.js`
- `apps/api/test/health.integration.test.js`
- `apps/api/test/auth.integration.test.js`
- `apps/api/test/user.integration.test.js`
- `apps/api/test/list.integration.test.js`

Required cases:

- liveness and database-aware readiness;
- request ID propagation/generation;
- consistent not-found, validation, auth, and internal errors;
- register/login success and invalid inputs;
- duplicate username/email;
- registration/profile responses omit password;
- absent, malformed, expired, and invalid bearer tokens;
- profile update affects only the authenticated user;
- owner/non-owner legacy list access;
- public-list validation and not-found behavior;
- list clear operations reject GET and accept DELETE;
- rate-limit response after the configured threshold.

## Browser test inventory

Create:

- `tests/e2e/anonymous-browse.spec.ts`
- `tests/e2e/login.spec.ts`

Required scenarios:

- anonymous user opens the default movie route, uses quick search, and opens a
  detail result through mocked catalog responses;
- protected-route navigation redirects to login with a safe return path;
- mocked successful login persists the current legacy token and returns to the
  protected route;
- mocked failed login shows a safe error.

## CI changes

Update `.github/workflows/ci.yml`:

1. frozen install;
2. formatting;
3. lint;
4. project-wide typecheck;
5. API syntax check through `pnpm check:api`;
6. `pnpm test:unit`;
7. web build;
8. install Playwright Chromium;
9. `pnpm test:e2e`;
10. upload Playwright report on failure.

No production secrets or live external services are available in PR CI.

## Verification

Agent-runnable:

- `pnpm install --frozen-lockfile`
- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm check:api`
- `pnpm test:unit`
- `pnpm build`
- `pnpm test:e2e`

User review:

- inspect safe error messages and request IDs;
- confirm login and protected-route redirects remain coherent;
- confirm list creation, add/remove, clear, and public links still behave as
  expected;
- confirm the app-level fallback is usable and does not expose stack details.

## Rollout and rollback

- All changes ship through the existing PR CI workflow.
- No database migration is introduced.
- API route changes are limited to the unused profile-update path and
  state-changing legacy clear routes.
- Rollback is a code/image rollback; no stored-data reversal is required.
- Account-lifecycle work may start only after this spec is merged and its CI
  gate remains green.
