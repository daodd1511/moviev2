# Product Capability Roadmap — Execution Plan

Spec: [PLAN.md](PLAN.md). Rulebook: `specs/RULEBOOK.md`.
Integration branch: `feature/product-capability-roadmap`. Branch model: stacked
(user directive 2026-08-01): each phase branches from its predecessor without waiting for
merge, and targets that predecessor's branch until it merges into the feature branch.
Roadmap Phase 0 is complete on `main` via `specs/security-test-foundation/`; remaining work begins at Phase 2.

## STATUS

- Current phase: 11 — in-progress
- Phase 0 — Security and test foundation: done
- Phase 2 — Library API: done (PR #8, CI green; awaiting merge)
- Phase 3 — Library client data and actions: done (PR #9, CI green)
- Phase 4 — Library views and editing: done (PR #10, CI green)
- Phase 5 — Collection model and migration compatibility: done (PR #11, CI green)
- Phase 6 — Collection API cutover: done (PR #12, CI green)
- Phase 7 — Collection web cutover: done (PR #13, CI green)
- Phase 8 — Catalog adapter: done (PR #14, CI green)
- Phase 9 — Discovery and search: done (PR #15, CI green)
- Phase 10 — Release sync and calendar: done (PR #16, CI green)
- Phase 11 — Notifications: in-progress
- Phase 12 — Collection collaboration: pending
- Phase 13 — Public social API: pending
- Phase 14 — Public social UI and sharing: pending
- Phase 15 — Final hardening and cleanup: pending
- Verification debt: none

## Phase 2 — Library API

Branch: `product-capability-roadmap/phase-2-library-api` (off `feature/product-capability-roadmap`, sequential)

Create the private Library storage and HTTP contract that every Library UI consumes.

Produces: `LibraryEntryService.list(ownerId, filters)`, `upsert(ownerId, input)`, `remove(ownerId, mediaType, tmdbId)`, `toLibraryEntryDto(entry)`, and `GET|PUT|DELETE /api/library/entries`.

- [x] Add `apps/api/src/model/library-entry.js` with the PLAN.md → "Library Entry" fields, integer `1..10` ratings, date/progress constraints, and unique `(ownerId, mediaType, tmdbId)` index.
- [x] Add `apps/api/src/dto/library-entry.dto.js`, `apps/api/src/validation/library-entry.schema.js`, and stable list/upsert/delete request and response DTOs.
- [x] Add `apps/api/src/service/libraryEntryService.js`, `apps/api/src/controller/library-entry.controller.js`, and `apps/api/src/router/library-entry.routes.js`; mount `/library/entries` in `apps/api/src/router/router.js` behind `verifyToken`.
- [x] Add `apps/api/test/library-entry.integration.test.js` for idempotent upsert, filters, transitions, date/progress rejection, deletion, and cross-user `404` isolation.

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck && pnpm check:api`
- [x] `pnpm test:unit` (full suite: shared persisted/serialized shapes)
- [x] `pnpm test:e2e`
- [x] `pnpm build`
- [x] CI green on the phase PR (PR #8)

- [x] (amended 2026-08-01) Remove Playwright from `package.json`, `pnpm-lock.yaml`, `.github/workflows/ci.yml`, `playwright.config.ts`, and `tests/e2e/`; rerun frozen install, format/lint, typecheck/API syntax, unit tests, and build without an E2E lane.

**Review checklist (user, at PR review):**

- [ ] Repeatedly upsert one title and confirm one private Library Entry is returned with the final state.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 3 — Library client data and actions

Branch: `product-capability-roadmap/phase-3-library-client` (off `product-capability-roadmap/phase-2-library-api`, stacked)

Wire the Library contract through typed client boundaries before adding Library pages.

Consumes: `GET|PUT|DELETE /api/library/entries` and its stable DTOs.
Produces: `LibraryEntryService.list(filters)`, `upsert(input)`, `remove(key)`, `LibraryEntryQueries.useList(filters)`, `useUpsert()`, `useRemove()`, and `<LibraryAction media={media} />`.

- [x] Add `apps/web/src/models/library-entry.model.ts`, `apps/web/src/api/dtos/library-entry.dto.ts`, and `apps/web/src/api/mappers/library-entry.mapper.ts` with strict watch-state, rating, date, progress, and media-snapshot types.
- [x] Add `apps/web/src/api/services/libraryEntryService.ts` and `apps/web/src/stores/queries/libraryEntryQueries.ts` with canonical query keys, optimistic updates, rollback, and invalidation.
- [x] Add `apps/web/src/shared/components/LibraryAction.tsx` and integrate it into `shared/components/List/MediaListItem.tsx`, `shared/components/Recommend.tsx`, `shared/components/Search/components/SearchResult.tsx`, `features/Movie/components/Detail/components/Content.tsx`, and `features/Tv/components/Detail/components/Content.tsx`.
- [x] Add `apps/web/src/shared/components/LibraryAction.test.tsx` and `apps/web/src/stores/queries/libraryEntryQueries.test.tsx` for planned/upsert/remove success, rollback, and accessible status announcements.
- [x] (amended 2026-08-02) Apply the project formatter to the Phase 3 client files reported by PR #9 CI.

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck && pnpm check:api`
- [x] `pnpm test:unit` (full suite: shared media action)
- [x] `pnpm build`
- [x] CI green on the phase PR (PR #9)

**Review checklist (user, at PR review):**

- [ ] Add and remove a title from a grid, search result, recommendation, and movie/TV detail page; confirm consistent state and rollback feedback.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 4 — Library views and editing

Branch: `product-capability-roadmap/phase-4-library-views` (off `product-capability-roadmap/phase-3-library-client`, stacked)

Build filterable Library pages and rich editing on the stable client data layer.

Consumes: `LibraryEntryQueries.useList(filters)`, `useUpsert()`, `useRemove()`, and Library model types.
Produces: authenticated `/user/library` routes and Library list/editor components.

- [x] Add `apps/web/src/features/Library/routes.tsx`, `pages/LibraryPage.tsx`, `components/LibraryFilters.tsx`, `components/LibraryEntryCard.tsx`, and `components/LibraryEntryEditor.tsx` for state, media type, rating, recency, notes, dates, and TV progress.
- [x] Mount `libraryRoutes` from `apps/web/src/routes/Router.tsx`, link it from `shared/components/Navbar/ProfileDropdown.tsx`, and treat `planned` as the Watchlist route/filter.
- [x] Add `apps/web/src/features/Library/pages/LibraryPage.test.tsx` and `components/LibraryEntryEditor.test.tsx` for URL filters, integer rating validation, date ordering, positive-integer TV progress validation, mutation feedback, and keyboard use.
- [x] (amended 2026-08-02) Do not introduce catalog bounds for TV progress: Phase 2's Library contract exposes no season/episode totals, so validate positive integer coordinates until the catalog adapter phase can supply bounds.

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck && pnpm check:api`
- [x] `pnpm test:unit`
- [x] `pnpm build`
- [x] CI green on the phase PR (PR #10)

**Review checklist (user, at PR review):**

- [ ] Edit movie and TV entries, reload, and verify filters, validation, focus, and status announcements on desktop and mobile widths.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 5 — Collection model and migration compatibility

Branch: `product-capability-roadmap/phase-5-collection-migration` (off `product-capability-roadmap/phase-4-library-views`, stacked)

Establish durable Collection storage and reversible legacy-list migration before switching APIs or UI.

Produces: `Collection`, `CollectionCompatibilityService.getLegacyPublic(username, legacyId)`, and resumable `migrate-lists-to-collections` dry-run/execute modes.

- [x] Add `apps/api/src/model/collection.js` with owner, visibility, embedded ordered items, owner collaborator, cover, timestamps, optimistic version, and preserved `legacyPublicId` uniqueness.
- [x] Add `apps/api/src/dto/collection.dto.js` and `apps/api/src/validation/collection.schema.js` with private-by-default visibility, item identity, ordering, and version contracts.
- [x] Add `apps/api/src/service/collectionCompatibilityService.js` for dual-read resolution of embedded lists and Collections without changing legacy writes yet.
- [x] Add `apps/api/scripts/migrate-lists-to-collections.js` with dry-run, cursor resume, audit counts, sampled payload checks, mandatory identifier preservation, and collision-blocked cutover.
- [x] Add `apps/api/test/collection-migration.integration.test.js` for idempotency, resume, counts, visibility=`unlisted`, item order, public-ID preservation, and rollback-safe legacy retention.
- [x] (amended 2026-08-03) Correct `apps/web/src/stores/queries/libraryEntryQueries.test.tsx` DELETE mocking and wait for mutation success so the full shared suite verifies real removal.

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck && pnpm check:api`
- [x] `pnpm test:unit` (full suite: shared schema and migration)
- [x] `pnpm build`
- [x] CI green on the phase PR (PR #11)

**Review checklist (user, at PR review):**

- [ ] Review a dry-run audit and sampled migrated payloads; confirm every legacy public URL identifier is unchanged before execution mode is allowed.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 6 — Collection API cutover

Branch: `product-capability-roadmap/phase-6-collection-api` (off `product-capability-roadmap/phase-5-collection-migration`, stacked)

Switch Collection writes and canonical reads only after compatibility storage exists.

Consumes: `Collection`, `CollectionCompatibilityService.getLegacyPublic(username, legacyId)`, and Collection DTO/schema contracts.
Produces: `CollectionService.listForUser`, `getAccessible`, `create`, `update`, `addItem`, `removeItem`, `reorderItems`, `remove`, and `/api/collections`.

- [x] Add `apps/api/src/service/collectionService.js`, `apps/api/src/controller/collection.controller.js`, and `apps/api/src/router/collection.routes.js`; mount `/collections` in `apps/api/src/router/router.js`.
- [x] Implement metadata, visibility, cover, duplicate, item-specific add/remove/reorder, optimistic-version conflict, and delete operations without whole-document client replacement.
- [x] Update `apps/api/src/router/user.routes.js` public legacy-list resolution to use `CollectionCompatibilityService` while retaining `/api/user/list/:username/:listId`.
- [x] Add `apps/api/test/collection.integration.test.js` for owner/non-owner access, unauthorized private `404`, unlisted links, item identity/order, conflicts, duplication, and mutation responses.
- [x] (amended 2026-08-03) Preserve the legacy public endpoint's `user_not_found` response for an unknown username through `collectionCompatibilityService.js`.

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck && pnpm check:api`
- [x] `pnpm test:unit` (full suite: legacy and canonical consumers)
- [x] `pnpm build`
- [x] CI green on the phase PR (PR #12)

**Review checklist (user, at PR review):**

- [ ] Exercise private, unlisted, and public Collection APIs plus a stale reorder; confirm disclosure and conflict behavior.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 7 — Collection web cutover

Branch: `product-capability-roadmap/phase-7-collection-web` (off `product-capability-roadmap/phase-6-collection-api`, stacked)

Move user-facing list behavior to canonical Collection language and mutation contracts.

Consumes: `/api/collections`, preserved legacy public routes, Collection DTOs, and optimistic versions.
Produces: canonical Collection models, services, queries, routes, pages, and mutation cache keys.

- [x] Replace `apps/web/src/models/list.model.ts`, `api/dtos/list.dto.ts`, `api/mappers/list.mapper.ts`, `api/services/listService.ts`, and `stores/queries/listQueries.ts` with their PLAN.md → "Collections web" Collection equivalents.
- [x] Replace `apps/web/src/features/List/` with `features/Collection/` pages/components for create, edit, duplicate, delete, item mutation/reorder, cover selection, visibility, copy-link, and conflict reload/retry.
- [x] Update `apps/web/src/shared/components/List/Menu.tsx`, `List/useAddToList.ts`, `features/User/pages/ListPage.tsx`, `features/User/routes.tsx`, and `routes/Router.tsx` to canonical Collection copy/routes while preserving incoming legacy links.
- [x] Add `apps/web/src/stores/queries/collectionQueries.test.tsx` and `apps/web/src/features/Collection/pages/CollectionPage.test.tsx` for create, edit, share, reorder, conflict, and delete journeys.

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck && pnpm check:api`
- [x] `pnpm test:unit` (full suite: renamed shared feature)
- [x] `pnpm build`
- [x] CI green on the phase PR (PR #13)

**Review checklist (user, at PR review):**

- [ ] Create, edit, reorder, share, duplicate, and delete Collections; open an old public-list URL and confirm it resolves without legacy wording.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 8 — Catalog adapter

Branch: `product-capability-roadmap/phase-8-catalog-adapter` (off `product-capability-roadmap/phase-7-collection-web`, stacked)

Create the provider-neutral server boundary required by discovery, calendars, and scheduled synchronization.

Produces: `CatalogProvider.discover`, `search`, `getMedia`, `getReleaseSchedule`, `TmdbCatalogProvider`, bounded TTL caching, and `/api/catalog`.

- [x] Add `apps/api/src/catalog/catalogProvider.js`, `tmdbCatalogProvider.js`, and `catalogCache.js` with provider-neutral DTO mapping, bounded TTL entries, timeout, retry-after handling, and normalized upstream errors.
- [x] Add `apps/api/src/service/catalogService.js`, `controller/catalog.controller.js`, `validation/catalog.schema.js`, and `router/catalog.routes.js`; mount `/catalog` in `router/router.js`.
- [x] Add `apps/api/test/catalog.integration.test.js` with deterministic upstream fixtures for movie/TV/person search, discovery filters, pagination, cache hit/expiry, `429`, timeout, and malformed responses.

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck && pnpm check:api`
- [x] `pnpm test:unit` (full suite: shared catalog boundary)
- [x] `pnpm build`
- [x] CI green on the phase PR (PR #14)

**Review checklist (user, at PR review):**

- [ ] Compare representative adapter search/discovery payloads with TMDB fixtures and confirm retryable errors expose no provider internals.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 9 — Discovery and search

Branch: `product-capability-roadmap/phase-9-discovery-search` (off `product-capability-roadmap/phase-8-catalog-adapter`, stacked)

Build URL-addressable discovery and full search on the provider-neutral catalog API.

Consumes: `/api/catalog` provider-neutral discovery/search DTOs.
Produces: `CatalogService`, `CatalogQueries`, URL-backed catalog filters, and `/search`.

- [x] Add `apps/web/src/models/catalog-query.model.ts`, `api/dtos/catalog.dto.ts`, `api/mappers/catalog.mapper.ts`, `api/services/catalogService.ts`, and `stores/queries/catalogQueries.ts`.
- [x] Extend `apps/web/src/shared/components/Filter/`, `features/Movie/components/MovieByDiscover.tsx`, and `features/Tv/components/TvByDiscover.tsx` with URL-backed sort, genre, year/date, vote-count, rating, reset, invalid, empty, loading, and retry states.
- [x] Add `apps/web/src/features/Search/routes.tsx`, `pages/SearchPage.tsx`, and result/filter components for movie/TV/person tabs, counts, sorting, pagination, local recent searches, and empty-query trending.
- [x] Update `apps/web/src/shared/components/Search/Search.tsx` to remain quick search and link full results into `features/Search`; mount routes in `routes/Router.tsx`.
- [x] Add `apps/web/src/shared/components/Filter/Filter.test.tsx` and `apps/web/src/features/Search/pages/SearchPage.test.tsx` for URL round trips, history navigation, media tabs, deterministic pagination, retry, recent-search clearing, and command-dialog handoff.

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck && pnpm check:api`
- [x] `pnpm test:unit` (full suite: catalog query migration)
- [x] `pnpm build`
- [x] CI green on the phase PR (PR #15)

**Review checklist (user, at PR review):**

- [ ] Share filtered movie and TV URLs, navigate back/forward, search all tabs, and confirm empty/error/retry behavior on desktop and mobile.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 10 — Release sync and calendar

Branch: `product-capability-roadmap/phase-10-release-calendar` (off `product-capability-roadmap/phase-9-discovery-search`, stacked)

Derive calendar data and resumable refresh state before creating notifications from release events.

Consumes: Library Entries and `CatalogProvider.getReleaseSchedule(input)`.
Produces: `ReleaseCalendarService.list`, `CatalogSyncService.run`, `/api/calendar`, and the resumable `sync-tracked-releases` CLI job.

- [x] Add `apps/api/src/model/catalog-sync-state.js`, `service/releaseCalendarService.js`, `service/catalogSyncService.js`, `controller/calendar.controller.js`, `validation/calendar.schema.js`, `router/calendar.routes.js`, and `jobs/sync-tracked-releases.js` with cursor, dry-run, limit, audit metrics, rate-limit backoff, and UTC fallback.
- [x] Mount `/calendar` in `apps/api/src/router/router.js` and add the scheduler-invoked sync command to `apps/api/package.json` and root `package.json`.
- [x] Add `apps/api/test/calendar.integration.test.js` and `apps/api/test/catalog-sync.integration.test.js` for tracked-only refresh, resume, repeated runs, movie/episode dates, unknown dates, IANA timezones, and upstream backoff.
- [x] Add `apps/web/src/api/services/calendarService.ts`, `stores/queries/calendarQueries.ts`, and `features/Calendar/` month/agenda pages; mount the authenticated route and navigation entry.
- [x] Add `apps/web/src/features/Calendar/pages/CalendarPage.test.tsx` for month/agenda, timezone boundaries, unknown dates, and tracked-only entries.

**Agent gate (hard):**

- [x] `pnpm install --frozen-lockfile`
- [x] `pnpm format:check && pnpm lint`
- [x] `pnpm typecheck && pnpm check:api`
- [x] `pnpm test:unit` (full suite: persisted sync and Library consumers)
- [x] `pnpm build`
- [x] CI green on the phase PR (PR #16)

**Review checklist (user, at PR review):**

- [ ] Compare month and agenda views in UTC and a non-UTC timezone; run sync dry-run/resume and confirm only tracked media is considered.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 11 — Notifications

Branch: `product-capability-roadmap/phase-11-notifications` (off `product-capability-roadmap/phase-10-release-calendar`, stacked)

Create deduplicated in-app delivery from the established release-sync event stream.

Consumes: `CatalogSyncService.run`, release schedule events, Library ownership, and user IANA timezone.
Produces: `NotificationService.list`, `markRead`, `updatePreferences`, `/api/notifications`, and notification-center queries/components.

- [x] Add `apps/api/src/model/notification.js`, `service/notificationService.js`, `controller/notification.controller.js`, `validation/notification.schema.js`, and `router/notification.routes.js` with event preferences, deduplication key, scheduled/delivered/read state, and private audit fields.
- [x] (amended 2026-08-03) Add `apps/api/src/model/notification-preference.js`: `updatePreferences(userId, input)` needs a per-user store for timezone and per-event opt-in that the `notification.js` model (one row per delivered notification) cannot hold; mount it via `NotificationService.getPreferences`/`updatePreferences`.
- [ ] Update `apps/api/src/service/catalogSyncService.js` and `jobs/sync-tracked-releases.js` to create idempotent in-app notifications only for opted-in tracked media; mount `/notifications` in `router/router.js`.
- [ ] Add `apps/api/test/notification.integration.test.js` and `apps/api/test/notification-sync.integration.test.js` for repeated sync, preferences, ownership, read state, timezone scheduling, and exclusion of tokens/private notes from logs.
- [ ] Add `apps/web/src/models/notification.model.ts`, DTO/mapper/service/query files from PLAN.md → "Calendar and notifications web", plus `features/Notifications/` center, unread indicator, and preferences UI.
- [ ] Add `apps/web/src/features/Notifications/components/NotificationCenter.test.tsx` for preferences, unread/read behavior, empty states, and repeated-sync deduplication.

**Agent gate (hard):**

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm format:check && pnpm lint`
- [ ] `pnpm typecheck && pnpm check:api`
- [ ] `pnpm test:unit` (full suite: job and persisted notification shapes)
- [ ] `pnpm build`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**

- [ ] Configure event preferences, rerun a release sync, and confirm one private in-app notification with correct read/unread behavior.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 12 — Collection collaboration

Branch: `product-capability-roadmap/phase-12-collaboration` (off `product-capability-roadmap/phase-11-notifications`, stacked)

Add username invitations and role enforcement on the versioned Collection boundary.

Consumes: `CollectionService`, Collection optimistic versions, and notification delivery.
Produces: `CollectionCollaborationService.invite`, `respond`, `revoke`, `changeRole`, `remove`, `transferOwnership`, and collaborator UI.

- [ ] Add `apps/api/src/model/collection-invitation.js`, `service/collectionCollaborationService.js`, collaboration schemas/controllers/routes under `/api/collections`, and invitation notification events.
- [ ] Enforce owner/editor/viewer permissions, username-only invite lookup, expiry, accept/decline/revoke, ownership transfer, collaborator removal, and exactly-one-owner invariants at the API boundary.
- [ ] Add `apps/api/test/collection-collaboration.integration.test.js` covering every role/operation pair, expiry/single response, stale version conflicts, owner preservation, and private activity redaction.
- [ ] Add `apps/web/src/features/Collection/components/Collaborators.tsx`, invitation inbox/actions, role controls, transfer confirmation, and conflict reload/retry using canonical Collection queries.
- [ ] Add `apps/web/src/features/Collection/components/Collaborators.test.tsx` for invite, accept/reject, edit authorization, transfer, and stale edits.

**Agent gate (hard):**

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm format:check && pnpm lint`
- [ ] `pnpm typecheck && pnpm check:api`
- [ ] `pnpm test:unit` (full suite: Collection authorization surface)
- [ ] `pnpm build`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**

- [ ] Walk owner/editor/viewer journeys across two users, including decline, revoke, ownership transfer, removal, and conflict recovery.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 13 — Public social API

Branch: `product-capability-roadmap/phase-13-social-api` (off `product-capability-roadmap/phase-12-collaboration`, stacked)

Create privacy-aware follow, like, public-profile, and Collection-discovery contracts before exposing social UI.

Consumes: public Collection visibility and canonical Collection deletion.
Produces: `SocialService.follow`, `unfollow`, `like`, `unlike`, `getPublicProfile`, `discoverCollections`, and social HTTP routes.

- [ ] Add `apps/api/src/model/follow.js` and `model/collection-like.js` with unique source relationships and indexes; add public-profile opt-in plus independent follower/following visibility preferences to `model/user.js` and `dto/user.dto.js`.
- [ ] Add `apps/api/src/service/socialService.js`, `controller/social.controller.js`, `validation/social.schema.js`, and `router/social.routes.js` for public profiles, follows, likes, counts, and public Collection discovery/sorting.
- [ ] Update `apps/api/src/service/collectionService.js` deletion/visibility transitions to clean or hide likes and discovery records without exposing private/unlisted metadata.
- [ ] Add `apps/api/test/social.integration.test.js` for uniqueness, opt-in/out, private identity lists, public counts, visibility transitions, deletion cleanup, authorization, and count reconciliation.

**Agent gate (hard):**

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm format:check && pnpm lint`
- [ ] `pnpm typecheck && pnpm check:api`
- [ ] `pnpm test:unit` (full suite: user and Collection public contracts)
- [ ] `pnpm build`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**

- [ ] Verify opt-in/out, follow privacy, like restrictions, discovery sorting, and public→unlisted→private transitions across two users.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 14 — Public social UI and sharing

Branch: `product-capability-roadmap/phase-14-social-sharing` (off `product-capability-roadmap/phase-13-social-api`, stacked)

Expose social controls and crawler-readable Collection shares on the stable privacy contracts.

Consumes: social HTTP routes, public profiles, public Collection discovery, and stable public IDs.
Produces: public profile/discovery UI and `ShareService.renderCollectionCard(publicId, origin)` crawler HTML.

- [ ] Add `apps/web/src/api/services/socialService.ts`, `stores/queries/socialQueries.ts`, `features/Profile/`, and `features/CollectionDiscovery/` for opt-in, privacy settings, follow/unfollow, like/unlike, counts, sorting, and empty/error states.
- [ ] Update `apps/web/src/routes/Router.tsx` with canonical public profile and Collection discovery/detail routes while retaining legacy public Collection redirects.
- [ ] Add `apps/api/src/service/shareService.js`, `controller/share.controller.js`, and `router/share.routes.js`; serve escaped Open Graph HTML for public/unlisted Collections and `404` with no metadata for private Collections.
- [ ] Update `apps/web/nginx.conf` to proxy canonical share URLs to the API and redirect human browsers into the SPA without changing crawler canonical URLs.
- [ ] Add `apps/api/test/share.integration.test.js`, `apps/web/src/features/Profile/pages/PublicProfilePage.test.tsx`, and `apps/web/src/features/CollectionDiscovery/pages/CollectionDiscoveryPage.test.tsx` for injection safety, follows, likes, discovery, canonical links, metadata, and privacy transitions.

**Agent gate (hard):**

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm format:check && pnpm lint`
- [ ] `pnpm typecheck && pnpm check:api`
- [ ] `pnpm test:unit` (full suite: public privacy and proxy surfaces)
- [ ] `pnpm build`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**

- [ ] Inspect public/unlisted link previews and canonical URLs, then make the Collection private and confirm metadata, caches, discovery, and social actions disappear.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.

## Phase 15 — Final hardening and cleanup

Branch: `product-capability-roadmap/phase-15-hardening` (off `product-capability-roadmap/phase-14-social-sharing`, stacked)

Remove compatibility paths only after production-ready substitutes, migration evidence, and operational checks exist.

Consumes: all canonical Library, Collection, catalog, calendar, notification, collaboration, and social contracts.

- [ ] Remove legacy list endpoints, embedded `User.lists`, compatibility reads/flags, old List web files/routes/copy, duplicate catalog query hooks, and dead mutation cache keys after migration audit evidence is recorded.
- [ ] Add `tests/load/catalog.mjs`, `library.mjs`, `collections.mjs`, and `notifications.mjs` with documented thresholds and synthetic data; add the runnable load command to root `package.json`.
- [ ] Add `scripts/verify-mongo-backup.sh` for explicit disposable-database `mongodump`/`mongorestore` verification and document required MongoDB Database Tools; never target an unresolved or production URI.
- [ ] Update `.github/workflows/ci.yml` for all deterministic final checks and add `docs/operations.md`, `docs/privacy.md`, and `docs/security.md` covering jobs, migrations, backup/restore, data exposure, and retained 30-day local-storage bearer-token risk.
- [ ] Reconcile source counts for Collections, items, follows, likes, and notifications; confirm no production read/write path references embedded lists before removing rollback code.

**Agent gate (hard):**

- [ ] `pnpm install --frozen-lockfile`
- [ ] `pnpm format:check && pnpm lint`
- [ ] `pnpm typecheck && pnpm check:api`
- [ ] `pnpm test:unit` (full suite: compatibility removal)
- [ ] `pnpm build`
- [ ] `pnpm load:test` against the documented disposable local stack
- [ ] `scripts/verify-mongo-backup.sh` against an explicit disposable MongoDB URI; if MongoDB Database Tools are unavailable, mark `[~]` with CI/operator substitute evidence per the rulebook
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**

- [ ] Complete keyboard, screen-reader, responsive, reduced-motion, migration-count, backup/restore, and operator-runbook review before approving legacy cleanup.

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review checklist goes into the PR description.
