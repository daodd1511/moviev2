# Security and Test Foundation — Execution Plan

Spec: [PLAN.md](PLAN.md). Rulebook: `specs/RULEBOOK.md`.
Integration branch: `main`. Branch model: stacked (default).

## STATUS

- Current phase: 5 — in-progress (local gate green, PR not yet opened)
- Phase 1 — Test harness and application seam: done
- Phase 2 — API boundary and observability: done
- Phase 3 — Authentication and account hardening: done
- Phase 4 — Legacy list hardening: done
- Phase 5 — Web resilience: in-progress
- Phase 6 — Browser smoke and authoritative CI: pending
- Verification debt: none

## Phase 1 — Test harness and application seam

Branch: `security-test-foundation/phase-1-test-harness` (off `main`, stacked)

Create dependency-free app construction and executable unit/integration test projects before
security behavior changes.

Produces: `createApp({ logger } = {})`, `connectDatabase(uri)`,
`disconnectDatabase()`, `getDatabaseState()`, Vitest projects `api` and `web`,
and root commands `test:unit`, `test:api`, `test:web`, `check:api`.

- [ ] Update `package.json`, `apps/api/package.json`, `apps/web/package.json`, and `pnpm-lock.yaml` with the PLAN.md → "Package and script changes" Vitest, Supertest, Testing Library, MSW, and MongoDB test dependencies and commands.
- [x] Add `vitest.config.ts` with `test.projects` (amended <2026-07-29>: the installed Vitest 4.1.10 dropped standalone `vitest.workspace.ts` support — confirmed by running it, which silently loaded zero projects); configure the `api` Node project with `apps/api/test/setup.js` and the `web` jsdom project with `apps/web/src/test/setup.ts`.
- [x] Refactor `apps/api/index.js`, add `apps/api/src/app.js#createApp`, and change `apps/api/src/config/db.config.js` to export `connectDatabase`, `disconnectDatabase`, and `getDatabaseState` without import-time connection or `process.exit`.
- [x] Add `apps/api/test/setup.js`, `apps/api/test/helpers/factories.js`, and `apps/api/test/health.integration.test.js` covering app construction, `/health`, and disposable MongoDB lifecycle.
- [x] Add `apps/web/src/test/setup.ts`, `apps/web/src/test/renderApp.tsx`, `apps/web/src/test/server.ts`, and `apps/web/src/test/handlers.ts` with isolated QueryClient/Jotai/router state and MSW cleanup.

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm check:api`
- [x] `pnpm test:unit`
- [x] `pnpm build`
- [x] CI green on the phase PR (`verify` job in `.github/workflows/ci.yml` passed; unrelated Netlify deploy-preview checks for the `flix-stream` site failed independently of this diff — not part of this repo's CI)

**Review checklist (user, at PR review):**

- [ ] Start the API normally and confirm `/health` responds while application startup still connects to the configured MongoDB.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before
push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review
checklist goes into the PR description.

## Phase 2 — API boundary and observability

Branch: `security-test-foundation/phase-2-api-boundary` (off
`security-test-foundation/phase-1-test-harness`, stacked)

Establish the shared HTTP, validation, error, and logging contracts consumed by every secured route.

Consumes: `createApp({ logger } = {})`, `getDatabaseState()`, Vitest project `api`.
Produces: `AppError`, `validate({ params, query, body })`, `notFoundHandler`,
`errorHandler`, request IDs, `logger`, API error envelope
`{ error: { code, message, requestId, details? } }`, and `/ready`.

- [x] Add `zod`, `express-rate-limit`, `pino`, and `pino-http` to `apps/api/package.json` and update `pnpm-lock.yaml`.
- [x] Add `apps/api/src/logger.js#logger` with redaction for authorization, cookie, password, and token fields.
- [x] Add `apps/api/src/errors/app-error.js#AppError`, `apps/api/src/middleware/request-id.middleware.js`, `apps/api/src/middleware/validate.middleware.js#validate`, and `apps/api/src/middleware/error.middleware.js` with the stable response envelope from PLAN.md → "Standardize API errors".
- [x] Update `apps/api/src/app.js` middleware order; enforce the `100kb` JSON limit and `CORS_ORIGINS` allowlist; add database-aware `GET /ready`; mount not-found and error handlers last.
- [x] Update `apps/api/src/router/router.js` and async controller dispatch so rejected route work reaches `errorHandler` instead of leaking or hanging (amended <2026-07-29>: added `apps/api/src/router/create-router.js#createRouter` — the wrapper had to live outside `router.js` because `router.js` imports `auth.routes.js`/`user.routes.js`/`list.routes.js`, and those importing a `createRouter` export back from `router.js` would be circular; `auth.routes.js`, `user.routes.js`, and `list.routes.js` now build their router via `createRouter()` instead of `express.Router()`).
- [x] Expand `apps/api/test/health.integration.test.js` for request-ID propagation/generation and readiness `200`/`503`; add `apps/api/test/error.integration.test.js` for not-found and redacted internal errors (amended <2026-07-29>: added `getTestMongoUri()` to `apps/api/test/setup.js` and silenced its `logger` — both needed to exercise the `/ready` 503 path and keep test output readable, without weakening the redaction contract itself).

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm check:api`
- [x] `pnpm test:unit`
- [x] `pnpm build`
- [x] CI green on the phase PR (`verify` job passed, PR #2)

**Review checklist (user, at PR review):**

- [ ] Inspect representative 404, 500, `/health`, and `/ready` responses and confirm request IDs are useful while stack/internal details remain hidden.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before
push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review
checklist goes into the PR description.

## Phase 3 — Authentication and account hardening

Branch: `security-test-foundation/phase-3-auth-account` (off
`security-test-foundation/phase-2-api-boundary`, stacked)

Secure identity boundaries before any account-lifecycle feature can consume them.

Consumes: `AppError`, `validate({ params, query, body })`, API error envelope, request IDs.
Produces: `AuthService.register(input)`, `AuthService.login(input)`,
`UserService.getUserById(userId)`, `UserService.getUserByUsername(username)`,
`UserService.updateProfile(userId, input)`, `toPublicUser(user)`, and authenticated
`GET|PUT /api/user/profile`.

- [x] Add `apps/api/src/validation/auth.schema.js` for strict trimmed register/login bodies and `apps/api/src/validation/user.schema.js` for strict profile updates without password or target-user fields.
- [x] Add `apps/api/src/dto/user.dto.js#toPublicUser`; update `apps/api/src/service/authService.js` and `apps/api/src/controller/auth.controller.js` to use the PLAN.md service signatures and return only public registration/login payloads (also collapses "no such user" and "wrong password" into the same `invalid_credentials` error, so login can't be used to enumerate usernames).
- [x] Update `apps/api/src/middleware/auth.middleware.js` to require a non-empty Bearer token and map every verification failure to `AppError` code `unauthorized`.
- [x] Update `apps/api/src/router/auth.routes.js` with validation plus a 10-request/15-minute IP rate limit for register/login (amended <2026-07-29>: added `app.set('trust proxy', 1)` to `apps/api/src/app.js` — without it `req.ip` always resolves to the upstream proxy's address in production, and to the same value for every test client, making per-IP rate limiting meaningless).
- [x] Update `apps/api/src/service/userService.js`, `apps/api/src/controller/user.controller.js`, and `apps/api/src/router/user.routes.js`; remove `PUT /api/user/update/:id` and add validated `PUT /api/user/profile` deriving identity only from `req.userId`. (`UserService.update`/`.delete` and `UserController.deleteUser` are untouched — `listService.js`, phase 4, still depends on the exact `update` signature.)
- [x] Add `apps/api/test/auth.integration.test.js`, `apps/api/test/user.integration.test.js`, and helper functions in `apps/api/test/helpers/auth.js` for invalid input, duplicates, safe DTOs, bearer failures, rate limiting, and same-user/non-owner update attempts (amended <2026-07-29>: `test/setup.js` now sets a synthetic `process.env.TOKEN_KEY` fallback — tests must not depend on a developer `.env`).

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm check:api`
- [x] `pnpm test:unit`
- [x] `pnpm build`
- [x] CI green on the phase PR (`verify` job passed, PR #3)

**Review checklist (user, at PR review):**

- [ ] Register and log in through the current UI, load Profile, and confirm no password/internal fields appear in browser network responses.
- [ ] Attempt the removed cross-account update URL and confirm it cannot update either account.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before
push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review
checklist goes into the PR description.

## Phase 4 — Legacy list hardening

Branch: `security-test-foundation/phase-4-legacy-lists` (off
`security-test-foundation/phase-3-auth-account`, stacked)

Secure and test the existing embedded-list API without pre-empting the later Collection migration.

Consumes: `AppError`, `validate({ params, query, body })`, verified `req.userId`, API error envelope.
Produces: validated owner-scoped legacy ListService methods, `DELETE /api/list`,
and `DELETE /api/list/:id/items`.

- [x] Add `apps/api/src/validation/list.schema.js` with the reusable 24-hex Mongo ID, strict username/list params, bounded list metadata, and strict movie/TV media payload schemas (the media schema matches the web app's `Media` model exactly — `id`, `posterPath`, `releaseDate`, `title`, `voteAverage`, `type` — since that's the one shape actually persisted into a list's `movies`/`tvShows` arrays, whether via the dedicated add/remove routes or a full list update).
- [x] Apply validation and `next(error)` propagation in `apps/api/src/router/list.routes.js` and `apps/api/src/controller/list.controller.js` for every active private and public-list route (amended <2026-07-29>: fixes `apps/api/src/router/user.routes.js`, touched in phase 3 — its `/profile` and public-list routes were wrapped in non-async lambdas like `(req, res) => { UserController.getProfile(req, res); }`, which don't return the inner promise to `createRouter`'s `wrapAsync`, so a thrown error became an unhandled rejection instead of reaching `errorHandler`. Found via this phase's `list.integration.test.js` timing out on the public-list not-found case. Fixed by passing the controller methods directly as handlers.).
- [x] Preserve the PLAN.md `ListService` signatures in `apps/api/src/service/listService.js`; replace document/reference equality checks with media-type-and-ID duplicate checks and map missing user/list/item cases to stable `AppError` codes.
- [x] Remove `GET /api/list/clear` and `GET /api/list/:id/clear`; add `DELETE /api/list` and `DELETE /api/list/:id/items` with owner scope.
- [x] Add `apps/api/test/list.integration.test.js` for owner/non-owner access, input validation, duplicate media, public-list not-found behavior, and rejected-GET/accepted-DELETE clear operations (`GET /list/clear` now falls through to `GET /list/:id` with `id="clear"`, correctly 400s on Mongo-id validation rather than clearing anything; `GET /list/:id/clear` matches no route and 404s).

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm check:api`
- [x] `pnpm test:unit`
- [x] `pnpm build`
- [x] CI green on the phase PR (`verify` job passed, PR #4)

**Review checklist (user, at PR review):**

- [ ] Create a list, add/remove movie and TV items, clear it, delete it, and open its public link; confirm safe errors for invalid and non-owner operations.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before
push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review
checklist goes into the PR description.

## Phase 5 — Web resilience

Branch: `security-test-foundation/phase-5-web-resilience` (off
`security-test-foundation/phase-4-legacy-lists`, stacked)

Make the current client consume hardened failures safely and pin its auth/list behavior with tests.

Consumes: API error envelope `{ error: { code, message, requestId, details? } }` and existing
legacy token model.
Produces: `AppErrorBoundary`, `reportError(error, context?)`, tested route guards,
token interception, login errors, and list-menu mutation feedback.

- [x] Add `apps/web/src/shared/utils/reportError.ts#reportError` and `reportError.test.ts` with a structured console sink that excludes tokens and submitted credentials (amended <2026-07-31>: `vitest.config.ts`, from phase 1, was missing the `@` path alias for the `web` project — it's declared in `apps/web/vite.config.ts`, a separate config Vitest doesn't inherit from. Every `@/...` import in a web test failed to resolve until this was added).
- [x] Add `apps/web/src/shared/components/AppErrorBoundary.tsx` and `AppErrorBoundary.test.tsx`; update `apps/web/src/App.tsx` to wrap route rendering with the safe reload/retry fallback (amended <2026-07-31>: `AppErrorBoundary` gained an optional `onReload` prop, defaulting to `window.location.reload`, for the same reason as `tokenErrorInterceptor`'s `redirectTo` above — replacing `window.location` in a test, by any method (`Object.defineProperty`, `vi.stubGlobal`), invokes jsdom's real navigation setter and was observed corrupting shared window state across test files. Dependency injection avoids touching the global at all).
- [x] Amended <2026-07-31>, no corresponding PLAN.md item: `apps/web/src/test/setup.ts` now installs its own in-memory `Storage` implementation over `globalThis.localStorage`. Root cause: running this project's Node-environment API tests in the same `vitest run` as these jsdom tests corrupts jsdom's real `window.localStorage` into an object with no working methods — Node 22.20 prints `` `--localstorage-file` was provided without a valid path `` (its own built-in Web Storage feature) and appears to hijack `localStorage` process-wide once triggered, including inside jsdom's separate global context. Confirmed via: `--project api` alone never triggers it; `--project web` alone never triggers it; only running both together does, consistently, regardless of Vitest pool/thread configuration (tried and reverted `pool: 'threads'`/`'forks'` per project — no effect). Root-caused to a Node/V8-level interaction, not project code; forcing a working `Storage` instance in `setup.ts` is the practical fix. Verified stable across 7 consecutive full `pnpm test:unit` runs after the fix (0 failures), vs. consistent failure before it.
- [x] Add `apps/web/src/routes/guards/AuthGuard.test.tsx` and `NoAuthGuard.test.tsx` for authenticated/anonymous navigation and safe redirects.
- [x] Add `apps/web/src/api/interceptors/token.interceptor.test.ts` for token attachment, excluded auth calls, unauthorized cleanup, and safe login redirect construction (amended <2026-07-31>: `tokenErrorInterceptor` gained an optional `redirectTo` parameter, defaulting to `window.location.replace`, so the redirect test doesn't have to stub `window.location` — see the `AppErrorBoundary`/`test/setup.ts` note below for why that matters here specifically).
- [x] Update `apps/web/src/features/Auth/components/LoginForm/LoginForm.tsx` to read the stable API error envelope; add `LoginForm.test.tsx` for safe redirects, success, and failure feedback (amended <2026-07-31>: added `apps/web/src/api/utils/getApiErrorMessage.ts`, a small shared helper for extracting the safe message from the error envelope — reused by `Menu`'s mutation feedback below rather than duplicated).
- [x] Update `apps/web/src/shared/components/List/Menu.tsx` to invalidate affected list queries and report media-specific success/failure; add `Menu.test.tsx` for movie/TV duplicate, mutation-success, and mutation-failure states (amended <2026-07-31>: extracted the mutation logic into `apps/web/src/shared/components/List/useAddToList.ts` — `Menu.test.tsx` tests the hook via `renderHook` rather than driving the Radix dropdown/submenu UI, which needs pointer-capture APIs jsdom doesn't implement; the Radix interaction itself is covered by the phase's manual review checklist).

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck`
- [x] `pnpm check:api`
- [x] `pnpm test:unit` (verified stable across 7 consecutive full runs — see the localStorage amendment above)
- [x] `pnpm build`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**

- [ ] Walk anonymous/protected navigation, successful and failed login, movie/TV list addition, and the app-level fallback with keyboard-only input.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before
push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review
checklist goes into the PR description.

## Phase 6 — Browser smoke and authoritative CI

Branch: `security-test-foundation/phase-6-ci-browser-smoke` (off
`security-test-foundation/phase-5-web-resilience`, stacked)

Make the complete foundation reproducible in browser smoke tests and authoritative PR CI.

Consumes: root unit/integration commands, hardened API contracts, tested web auth/list behavior.
Produces: `test:e2e`, Playwright Chromium configuration, anonymous/login smoke specs,
and CI enforcement for all local gates.

- [ ] Add `@playwright/test`, root `test:e2e` and `test:e2e:install` scripts, `playwright.config.ts`, and the resulting `pnpm-lock.yaml` changes.
- [ ] Add `tests/e2e/anonymous-browse.spec.ts` with mocked catalog responses for default browse, quick search, and detail navigation.
- [ ] Add `tests/e2e/login.spec.ts` with mocked backend responses for protected redirect, successful legacy-token login/return, and safe failed-login feedback.
- [ ] Update `.github/workflows/ci.yml` to run frozen install, format, lint, project-wide typecheck, `pnpm check:api`, `pnpm test:unit`, web build, Chromium installation, and `pnpm test:e2e`; upload the Playwright report only on failure.
- [ ] Update `.gitignore` only for generated Vitest coverage, Playwright report, and test-results directories while preserving unrelated user entries.

**Agent gate (hard):**

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm format:check && pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm check:api`
- [ ] `pnpm test:unit`
- [ ] `pnpm build`
- [ ] `pnpm test:e2e`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**

- [ ] Review the Playwright report and repeat anonymous browse, protected redirect, login return, and failed-login scenarios in the deployed preview.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before
push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review
checklist goes into the PR description.
