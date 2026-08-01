# Product Capability Roadmap

Written 2026-07-29 for the `moviev2` repository.

## Outcome

Turn Flix from a catalog browser with basic lists into a secure personal media
library with:

- production-ready authentication and account management;
- watch-state, rating, progress, date, and note tracking;
- editable private, unlisted, and public collections;
- complete movie, TV, and person search with functional discovery filters;
- release calendars and notifications;
- collection collaboration, follows, likes, and rich share previews.

Streaming-provider availability ("where to watch") is explicitly excluded.

## Product baseline

Keep and extend the working capabilities:

- movie and TV category browsing;
- infinite-scroll result grids;
- movie and TV detail pages;
- trailers, cast, people, seasons, and recommendations;
- account registration and login;
- personal lists and public list links.

This roadmap does not redesign those experiences unless a phase needs to
integrate a new capability.

## Non-goals

- streaming-provider availability, pricing, or regional provider data;
- public text reviews, comments, or direct messaging;
- replacing TMDB as the catalog source;
- building a general-purpose social network;
- native mobile applications;
- an API framework or database rewrite.

Public text content stays out of scope because it would require moderation,
reporting, abuse prevention, and legal workflows disproportionate to the
current product.

## Decisions

### Separate tracking from curation

The personal Library and user-created Collections are different concepts.

- **Library**: the complete private set of media a user tracks.
- **Library Entry**: one user's state for one movie or TV show.
- **Collection**: a named, ordered group curated by one or more users.
- **Collection Item**: a movie or TV show placed in a Collection.

A title may have one Library Entry and appear in any number of Collections.
Do not encode watch state, ratings, or progress inside Collection items.

The current `List` feature becomes Collection. During migration, existing API
paths and stored list documents may remain compatibility details, but new UI
copy and domain code use Collection consistently.

### Use one watch-state vocabulary

Library Entry watch states:

- `planned`
- `watching`
- `completed`
- `paused`
- `dropped`

Movies normally move from `planned` to `completed`, but the model does not
forbid `watching` or `paused`. TV progress is stored as season/episode
coordinates plus an optional watched-episode count.

"Watchlist" is a filtered view of `planned` Library Entries, not a separate
storage model.

### Collection visibility is explicit

Collections use:

- `private`: owner and collaborators only;
- `unlisted`: accessible by link but not discoverable;
- `public`: accessible and discoverable.

New Collections default to `private`. Existing public-link lists migrate to
`unlisted`, preserving link behavior without making them discoverable.

### Collaboration uses roles

Collection collaborators have one role:

- `owner`: full control, including visibility, collaborators, and deletion;
- `editor`: edit metadata, order, and items;
- `viewer`: read private or unlisted content.

Ownership transfer is explicit. A Collection always has exactly one owner.
Likes and follows never grant edit access.

### Secure sessions before account expansion

Replace the 30-day bearer token stored in local storage with:

- short-lived access tokens;
- rotating refresh tokens in `HttpOnly`, `Secure`, `SameSite` cookies;
- hashed refresh-token records with expiry and revocation;
- logout-current-session and logout-all-sessions operations.

Do not add password reset, email verification, or collaboration invitations
on top of the current long-lived local-storage token.

### Validate at the API boundary

Use Zod schemas for request parameters, query strings, and bodies. Return
stable response DTOs rather than Mongoose documents. Password hashes, token
records, and internal fields never leave the API.

Introduce shared contracts only for payloads consumed by both applications;
do not turn this into a monorepo-wide type-system rewrite.

### Migrate data without a flag day

New Library Entry and Collection documents live in separate MongoDB
collections rather than embedded arrays on User.

Migration sequence:

1. Add new collections and indexes.
2. Dual-read old lists and new Collections behind a server-side compatibility
   layer.
3. Backfill existing users and lists with an idempotent migration.
4. Verify counts and sampled payloads.
5. Switch writes to the new model.
6. Remove the legacy embedded-list path only after rollback is no longer
   required.

Every migration must support dry-run, resumability, and an audit summary.

### Move catalog access behind an adapter

Keep TMDB as the source, but introduce a server-side catalog provider adapter
for new search, calendar, and notification work. Add caching and rate-limit
handling there.

Existing browser-side catalog calls may migrate incrementally. Do not block
the security phase on a full catalog proxy rewrite.

## Target domain model

### Account

- identity and verified email;
- password credentials;
- profile;
- sessions and refresh-token records;
- notification preferences.

### Library Entry

- owner ID;
- media type and TMDB ID;
- watch state;
- personal rating;
- notes;
- started, completed, and last-watched dates;
- TV progress;
- cached display snapshot and catalog-sync timestamp.

Unique index: `(ownerId, mediaType, tmdbId)`.

### Collection

- owner ID;
- name and description;
- visibility;
- cover selection;
- ordered Collection Items;
- collaborators and roles;
- timestamps and optimistic-concurrency version.

### Social relationship

- follow: follower → followed user;
- like: user → public Collection;
- activity events derived only from explicitly public actions.

Do not expose private Library activity.

### Notification

- recipient;
- event type;
- referenced media or Collection;
- delivery channel and state;
- scheduled/delivered/read timestamps;
- deduplication key.

## Cross-cutting quality gates

Every phase must pass:

- `pnpm install --frozen-lockfile`
- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- API syntax/type checks appropriate to the phase
- affected unit and integration tests
- affected Playwright smoke journeys

No phase may delete, skip, or weaken a test to pass its gate.

### Test stack

- Vitest for web and shared-contract unit tests;
- React Testing Library for component behavior;
- Vitest or Node test runner plus Supertest for API integration tests;
- a disposable MongoDB test database for repository/service tests;
- MSW for deterministic catalog and backend client tests;
- Playwright for critical cross-application journeys.

Required initial journeys:

- register, verify, login, refresh, logout;
- create and update a Library Entry;
- create, edit, share, and delete a Collection;
- search and filter catalog results;
- accept and reject a collaboration invitation.

### Operational baseline

Before scheduled jobs or social features:

- structured request logging with request IDs;
- centralized API error mapping;
- health and readiness endpoints;
- security and notification audit events;
- migration and scheduled-job metrics;
- error reporting for both applications.

Do not log passwords, tokens, email-verification secrets, reset tokens, or
private notes.

## Phase 0 — Security and test foundation

### API correctness

- Prevent users from updating another account through
  `PUT /user/update/:id`; account mutations derive the target user from the
  authenticated session.
- Return explicit account DTOs; never return password hashes.
- Add Zod validation to auth, account, Collection, and public-link inputs.
- Add payload limits, auth endpoint rate limits, safe CORS configuration, and
  consistent 4xx/5xx responses.
- Replace callback/response-owned auth services with service methods that
  return values or throw typed application errors.
- Replace state-changing `GET` endpoints such as list clearing with the
  appropriate mutation verbs.

### Test harness

- Replace the API's failing placeholder test script.
- Add API integration coverage for authentication, ownership, public access,
  and Collection mutations.
- Add web tests for route guards, token expiry handling, list mutations, and
  error states.
- Add a minimal Playwright smoke suite for anonymous browsing and login.

### Observability

- Add request IDs, structured logs, health/readiness endpoints, and error
  reporting.
- Record authentication failures and ownership denials without recording
  credentials.

Hard gate:

- the known cross-account update vulnerability is covered by a failing-then-
  passing integration test;
- registration and profile responses contain no password field;
- anonymous, owner, and non-owner authorization cases are tested;
- CI runs all new gates.

## Phase 1 — Session and account lifecycle

### Sessions

- Implement short-lived access tokens and rotating refresh cookies.
- Add session listing, current-session logout, and all-session logout.
- Revoke refresh-token families on reuse detection.
- Remove local-storage token persistence after the cookie migration is
  complete.

### Account flows

- Email verification with expiring, single-use tokens.
- Forgot-password and reset-password flows with single-use tokens.
- Change password with current-password verification.
- Edit username and profile fields with uniqueness checks.
- Change email with re-verification.
- Delete account with recent-authentication confirmation and a documented data
  deletion policy.

### UX

- Expand Profile into account, security, sessions, and notification sections.
- Preserve safe post-login redirects.
- Provide explicit expired-link, invalid-link, and resend states.

Hard gate:

- refresh-token rotation, reuse detection, expiry, and revocation are
  integration-tested;
- verification and reset tokens are hashed at rest and single-use;
- account deletion removes or anonymizes dependent data according to policy.

## Phase 2 — Personal Library

### Data model

- Add Library Entry storage and the `(ownerId, mediaType, tmdbId)` unique
  index.
- Store watch state, rating, notes, dates, TV progress, and a cached display
  snapshot.
- Provide idempotent upsert and delete endpoints.

### Web experience

- Add one consistent Library action to movie, TV, grid, search, and
  recommendation items.
- Add Library views filtered by state, media type, rating, and recency.
- Treat `planned` as the Watchlist view.
- Add rating, notes, dates, and progress editing.
- Add optimistic updates with rollback and accessible status announcements.

### Rules

- Personal ratings use a single documented scale.
- Completion dates cannot precede start dates.
- TV progress cannot exceed known season/episode bounds when catalog data is
  available.

Hard gate:

- repeated upserts cannot create duplicate Library Entries;
- all state transitions and invalid progress cases are tested;
- private Library data is inaccessible to other users.

## Phase 3 — Collections and legacy-list migration

### Collection capabilities

- Create, edit, rename, describe, duplicate, and delete Collections.
- Add and remove items through item-specific endpoints, not whole-document
  replacement.
- Reorder items and select a cover.
- Add private, unlisted, and public visibility controls.
- Add a copy-link action and clear visibility explanation.

### Migration

- Backfill embedded lists into Collections.
- Preserve stable public-link identifiers where possible.
- Migrate existing links to `unlisted`.
- Compare per-user list/item counts before switching reads.
- Remove the embedded list model only after production verification.

### Client consistency

- Use canonical query keys.
- Invalidate or update Collection detail, Collection index, and public views
  after every mutation.
- Fix media-specific success/error copy.

Hard gate:

- migration dry-run and execution are idempotent;
- existing public links continue to resolve;
- private Collections return 404 or 403 according to the documented disclosure
  policy;
- concurrent reorder/edit conflicts do not silently lose data.

## Phase 4 — Discovery and search

### Discovery

- Connect existing sort and genre controls to browse queries.
- Add year/date range, minimum vote count, and rating filters.
- Implement the same filter model for movies and TV with media-specific
  options.
- Store filter state in the URL so views are shareable and browser navigation
  works.
- Provide reset, empty, loading, retry, and invalid-filter states.

### Search

- Add a dedicated search results route.
- Include movies, TV shows, and people.
- Add tabs, filters, sorting, pagination/infinite loading, and result counts.
- Keep the command dialog as quick search and link it to the full results page.
- Add local recent searches with clear/remove controls.
- Add trending suggestions for an empty query.

### Catalog adapter

- Route new search/discovery requests through the catalog provider adapter.
- Cache stable catalog responses and handle upstream rate limits and failures
  consistently.
- Keep provider-specific DTOs outside UI and domain models.

Hard gate:

- every supported filter round-trips through the URL;
- movie, TV, and person results have deterministic pagination;
- upstream failures render retryable product states rather than raw errors.

## Phase 5 — Release calendar and notifications

### Calendar

- Build a release calendar from planned/watching Library Entries.
- Support month and agenda views.
- Show movie release dates and known TV season/episode dates.
- Make timezone and unknown-date behavior explicit.

### Catalog synchronization

- Add a resumable scheduled job that refreshes tracked titles through the
  catalog provider adapter.
- Store last-sync state and back off on upstream rate limits.
- Do not scan the entire TMDB catalog; refresh only media tracked by users who
  need calendar or notification data.

### Notifications

- Add in-app notifications for configured release events.
- Add per-event and global preferences.
- Deduplicate notifications across repeated sync runs.
- Add read/unread state and a notification center.
- Treat email or browser push as follow-up channels behind the same preference
  and delivery model.

Hard gate:

- repeated jobs do not create duplicate notifications;
- dates render correctly across tested timezones;
- users receive notifications only for their tracked media and preferences.

## Phase 6 — Collection collaboration

### Invitations and roles

- Invite an existing user by username or verified email.
- Accept, decline, revoke, and expire invitations.
- Enforce owner/editor/viewer permissions at the API boundary.
- Support ownership transfer and collaborator removal.
- Prevent removing the only owner.

### Concurrent editing

- Use optimistic concurrency versions for Collection metadata and ordering.
- Return an explicit conflict response when clients edit stale versions.
- Provide a reload/retry UX rather than silently overwriting changes.

### Activity

- Record Collection activity needed for collaborator awareness.
- Exclude private notes, private Library activity, tokens, and account-security
  events.

Hard gate:

- every role/operation pair has an authorization test;
- invitation tokens are expiring and single-use;
- stale writes cannot overwrite newer Collection state.

## Phase 7 — Public social and sharing

### Public profiles and follows

- Add an explicit public-profile opt-in.
- Show only public Collections and deliberately public profile fields.
- Follow and unfollow public profiles.
- Provide follower/following privacy controls.

### Collection likes and discovery

- Like and unlike public Collections.
- Add public Collection discovery and sorting.
- Prevent likes on private or unlisted Collections.
- Make unlike and account deletion clean up derived counts correctly.

### Sharing

- Add Open Graph and social-card metadata for public and unlisted Collections.
- Add stable canonical URLs and copy/share actions.
- Ensure private Collection metadata never appears in server-rendered previews
  or caches.

No comments, public text reviews, or direct messages are introduced.

Hard gate:

- privacy-transition tests cover public → unlisted → private;
- blocked/private users and deleted accounts disappear from social views;
- derived follow/like counts reconcile from source records.

## Phase 8 — Final hardening and cleanup

- Remove legacy list endpoints, compatibility reads, and migration flags.
- Remove dead discovery/query state and duplicate query hooks.
- Audit all mutation cache updates and error states.
- Run keyboard, screen-reader, responsive, and reduced-motion checks on every
  new flow.
- Add load tests for search, Library, public Collection, and notification
  endpoints.
- Add backup/restore verification for the new MongoDB collections.
- Update deployment, privacy, security, and operator documentation.

Final hard gate:

- no embedded-list production reads or writes remain;
- no long-lived local-storage authentication token remains;
- all migrations have reconciliation reports;
- all phase smoke journeys pass in CI and against the production-like stack.

## Delivery structure

This roadmap is an umbrella plan. Before execution, create one feature spec
and `EXECUTION.md` per phase:

```text
specs/
├── product-capability-roadmap/
│   └── PLAN.md
├── security-test-foundation/
├── account-lifecycle/
├── personal-library/
├── collections/
├── discovery-search/
├── release-calendar-notifications/
├── collection-collaboration/
└── public-social-sharing/
```

Each feature spec owns its schema details, endpoint contract, UI states,
migration steps, and phase-specific tests. Do not execute multiple data-model
phases concurrently.

## Recommended release slices

1. **Safe foundation** — Phases 0–1.
2. **Retention core** — Phases 2–3.
3. **Discovery** — Phase 4.
4. **Re-engagement** — Phase 5.
5. **Multi-user value** — Phases 6–7.
6. **Consolidation** — Phase 8.

The app is meaningfully better and releasable after each slice. Social work
does not start until account, privacy, ownership, migration, and notification
foundations are stable.
