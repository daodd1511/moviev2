# Catalog and UI Repair

Written 2026-08-04 for the `moviev2` repository.

## Outcome

Restore catalog browsing to what the navigation already promises, and finish the
half-built surfaces the capability roadmap left behind:

- movie and TV category browsing that actually fetches the selected category;
- infinite-scroll result grids on every list whose API paginates;
- catalog filters that work, including a genre picker instead of raw TMDB ids;
- shadcn components in place of the remaining raw form elements;
- a Collection experience that shows artwork and hides its own optimistic-lock
  internals;
- a trailer control that reads like a button and lists trailers with dates.

## Context — this is one regression plus four polish items

`72dc650 feat(discovery): add catalog search client` replaced
`MovieQueries.useInfiniteListByDiscover(discover)` — a `useInfiniteQuery` that
consumed the category path param *and* drove `useInfiniteScroll` — with
`CatalogQueries.useDiscover({ mediaType, page, sort_by, with_genres })`, which
takes no category and fetches one page. Category browsing and infinite scroll
were the same code, and one commit removed both. `946314b` later deleted the
orphaned hooks; correct as dead-code removal, but it buried the evidence.

The regression is not revertable. The old hook worked because `apps/web`'s axios
`api` instance pointed at TMDB with `api_key` baked into the client bundle. The
roadmap deliberately moved TMDB behind the Express proxy. Restoring the
capability means adding category support to the server, not restoring the hook.

Two more surfaces are broken in the same way — the data path exists and the UI
does not use it:

- `CollectionDiscoveryPage` hardcodes `page: 1` against an endpoint that accepts
  `page` and `limit`, so results past the first page are silently dropped.
- `CatalogFilters` writes `year` and `rating` to the URL; `MovieByDiscover` and
  `TvByDiscover` read only `sort` and `genres`. Two of four controls do nothing.

## Non-goals

- drag-and-drop reorder for Collection items — deferred, own grill;
- server-side pagination for the Library and for Collection items — neither is
  paginated today, neither is broken at current data volumes;
- a sweep of `shared/components/ui/` for shadcn equivalents;
- redesigning Collection screens against a new mockup — `DESIGN.md` has no
  Collection screen spec, so this work applies the existing system;
- replacing TMDB, or changing the catalog proxy architecture.

## Decisions

### Categories are a provider concern, not a sort order

TMDB's named categories are separate endpoints — `/movie/popular`,
`/movie/top_rated`, `/movie/upcoming`, `/tv/popular`, `/tv/top_rated`,
`/tv/on_the_air` — and are not reproducible through `/discover`. `upcoming` and
`on_the_air` are date-windowed against today; `popular` uses TMDB's internal
popularity ranking that `sort_by=popularity.desc` only approximates.

`catalogDiscoverSchema` gains an optional `category`. `TmdbCatalogProvider`
routes to the named endpoint when `category` is present and to `/discover`
otherwise. `CatalogCache` keys on `{ operation, ...input }`, so adding the field
separates cache entries without further work.

Mapping categories onto `/discover` sort params was rejected: it would change
what users see under labels that name TMDB's actual lists.

### Category and filters are mutually exclusive, and the UI says so

TMDB's named endpoints accept only `page`. A category and a filter set cannot
both apply to one request.

`MOVIE_DISCOVER` and `TV_DISCOVER` gain a **Discover** entry alongside Popular /
Top Rated / Upcoming / On Air. `CatalogFilters` renders only when the active tab
is Discover. The either/or is visible in the tab strip and in the URL rather than
hidden behind a silent mode flip when a user touches a filter.

### Filters ship complete or not at all

The Discover tab exists to be the filtering surface, so it does not ship with a
control that requires memorizing TMDB genre ids.

- new `GET /api/catalog/genres?mediaType=` — the API has no genre route today
  (`with_genres` is a passthrough string); the old web-side `MovieService.getGenres`
  called TMDB directly and died with the proxy move;
- genre multi-select replaces the comma-separated text input;
- `year` maps to `primary_release_date.gte`/`.lte` for movies and
  `first_air_date.gte`/`.lte` for TV;
- `rating` maps to `vote_average.gte`.

The last two need no schema change — `catalogDiscoverSchema` already accepts
those fields.

### Infinite scroll covers every list the server paginates

Catalog, search, and Collection discovery move to `useInfiniteQuery` plus the
existing `shared/hooks/useInfiniteScroll.ts` (currently importer-free). Search's
prev/next pager is replaced rather than kept: two pagination idioms in one app
get rediscovered as a bug later.

Library and Collection items are excluded — neither endpoint paginates, and
adding that is new server work on surfaces that are not broken.

### Page number leaves the URL

`useInfiniteQuery` owns page state, so `?page=` is removed from catalog and
search URLs. `CatalogFilters.setValue` already deletes it on every filter change.

Keeping it as a starting page was rejected: the value goes stale on first scroll,
and TMDB's `popular` ordering shifts daily, so a shared "page 7" does not resolve
to the same titles anyway. Scroll restoration on back-navigation is a checklist
item; TanStack Query already keeps fetched pages cached, so only scroll position
is missing.

### shadcn components come from the CLI, unmodified, first

`DESIGN.md` already names shadcn/Radix the component layer and splits
`components/ui` (generated) from `shared/components/ui` (custom compositions).
Eight files still use raw `<select>`, `<label>`, `<input>`, and `<textarea>`.

Process, binding on the migration phase: run
`pnpm dlx shadcn@latest add <component>`, commit the generated files unmodified,
and customize in a separate later commit. Do not hand-write a component the
registry ships.

The migration also adopts shadcn `field` (`Field`/`FieldLabel`/`FieldError`) —
this project's style (`radix-nova`) ships `field` rather than the classic `form`
(`FormField`/`FormItem`/`FormMessage`); `FieldError` accepts an `errors` array
shaped like React Hook Form's `formState.errors`, so `register()` plugs in
directly without a `Controller` wrapper — and retires the bespoke
`shared/components/ui/TextField.tsx`. `react-hook-form@7.83`,
`@hookform/resolvers`, and `zod` are already dependencies and `CollectionForm`
already uses `useForm`/`zodResolver`, so this converts existing wiring rather
than introducing a form library.

### The migration lands before the catalog work

`CatalogFilters` is both a shadcn holdout and the file the catalog work rewrites.
Converting first makes phase 1 a pure zero-behavior-change refactor — the safest
kind to land on a shared integration branch — and lets every later phase build on
the final component vocabulary. Building filter behavior on raw elements and
converting afterwards would write the same file twice.

### Optimistic locking stops leaking into the Collection UI

`CollectionPage` currently renders `<h1>Edit Collection</h1>`, a `Version {n}`
subtitle, a `Reload` button, and a paragraph explaining conflict semantics. All
four are removed.

On `collection_version_conflict`: refetch, preserve the user's input in the form,
and report that the Collection changed elsewhere and the changes were not saved.

Auto-retry against the refetched version was rejected. Collections have
collaborators, so a silent retry overwrites the concurrent edit that optimistic
locking exists to protect.

### Collections show artwork

`cover: CollectionItemKey | null` is on the model and accepted by
`UpdateCollectionInput`; nothing writes it, and `CollectionListPage` renders no
artwork despite every item carrying `posterPath`.

A "Set as cover" action writes it. When `cover` is null, fall back to a mosaic of
the first four item posters, or the first item's poster below four items. Cards
always show art, and no Collection needs manual attention to look right.

### Resolved implementation choices

- category values stay the TMDB endpoint names already in
  `shared/constants/discover.ts` (`popular`, `top_rated`, `upcoming`,
  `on_the_air`) plus a new `discover`;
- the genre list is cached through the existing `CatalogCache`, not a new cache;
- the item-search box in `CollectionItems` becomes a debounced `command` palette;
  `command` is already installed;
- visibility renders as a `badge` with human copy, not the raw enum string;
- `likeCount` renders on the owner's own Collection cards;
- trailer publish dates format through a new function in
  `shared/utils/formatDate.ts` using that module's existing `toLocaleDateString`
  idiom — not a direct `Intl.DateTimeFormat` call;
- `shared/components/Filter/{index,Sort,Genre}.tsx` and
  `stores/atoms/queryParamsAtom.ts` are deleted; they have zero live importers,
  are superseded by `CatalogFilters`, and are the only remaining consumers of
  `MovieQueries.useGenres`/`TvQueries.useGenres`, which the new genre endpoint
  obsoletes;
- `docs/BACKLOG.md` is created in phase 1; `CLAUDE.md` mandates it and it does
  not exist.

### Implementation surfaces

- shadcn migration: `apps/web/src/components/ui/` (CLI-generated additions),
  `features/Library/components/LibraryFilters.tsx`,
  `features/Library/components/LibraryEntryEditor.tsx`,
  `shared/components/Filter/CatalogFilters.tsx`,
  `features/Collection/components/CollectionForm.tsx`,
  `features/Collection/components/Collaborators.tsx`,
  `features/Collection/components/CollectionItems.tsx`,
  `features/CollectionDiscovery/pages/CollectionDiscoveryPage.tsx`,
  `features/User/pages/ProfilePage.tsx`; delete
  `shared/components/ui/TextField.tsx`,
  `shared/components/Filter/{index,Sort,Genre}.tsx`, and
  `stores/atoms/queryParamsAtom.ts`.
- Catalog API: `apps/api/src/validation/catalog.schema.js`,
  `catalog/catalogProvider.js`, `catalog/tmdbCatalogProvider.js`,
  `service/catalogService.js`, `controller/catalog.controller.js`,
  `router/catalog.routes.js`, and `test/catalog.integration.test.js`.
- Catalog web: `models/catalog-query.model.ts`, `api/dtos/catalog.dto.ts`,
  `api/mappers/catalog.mapper.ts`, `api/services/catalogService.ts`,
  `stores/queries/catalogQueries.ts`, `shared/constants/discover.ts`,
  `shared/components/DiscoverTabs.tsx`,
  `shared/components/Filter/CatalogFilters.tsx`,
  `features/Movie/components/MovieByDiscover.tsx`,
  `features/Tv/components/TvByDiscover.tsx`,
  `features/Movie/pages/MoviesPage.tsx`, `features/Tv/pages/TVsPage.tsx`, and
  `shared/hooks/useInfiniteScroll.ts`.
- Infinite scroll elsewhere: `features/Search/pages/SearchPage.tsx`,
  `features/CollectionDiscovery/pages/CollectionDiscoveryPage.tsx`, and
  `stores/queries/socialQueries.ts`.
- Trailer: `shared/components/ui/TrailerDialog.tsx`,
  `features/Movie/components/Detail/components/Content.tsx`,
  `features/Tv/components/Detail/components/Content.tsx`, and
  `shared/utils/formatDate.ts`.
- Collection UI: `features/Collection/pages/CollectionPage.tsx`,
  `features/Collection/pages/CollectionListPage.tsx`,
  `features/Collection/components/CollectionItems.tsx`,
  `features/Collection/components/CollectionForm.tsx`, and
  `stores/queries/collectionQueries.ts`.

### Phase interfaces

- Catalog API: `CatalogProvider.discover({ mediaType, category?, page, ...filters })`
  and a new `CatalogProvider.getGenres({ mediaType })`, implemented by
  `TmdbCatalogProvider` and exposed as `GET /api/catalog/discover` (extended) and
  `GET /api/catalog/genres`, returning provider-neutral DTOs.
- Catalog web: `CatalogService.discover(input)` accepting `category`;
  `CatalogService.getGenres(mediaType)`;
  `CatalogQueries.useInfiniteDiscover(input)`, `useGenres(mediaType)`, and
  `useInfiniteSearch(query, type)`.
- Social web: `SocialQueries.useInfiniteDiscovery({ sort, limit })`.
- Trailer: `formatMediumDate(date: string): string` exported from
  `shared/utils/formatDate.ts`.

## Cross-cutting quality gates

Every phase must pass:

- `pnpm install --frozen-lockfile`
- `pnpm format:check`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm check:api`
- `pnpm test:unit`
- `pnpm build`

No phase may delete, skip, or weaken a test to pass its gate.

Review-checklist journeys, walked by the user before merging the phase that
touches them:

- switch between Popular, Top Rated, and Upcoming and confirm the grid contents
  change, not only the heading;
- scroll a catalog grid past the first page and confirm more titles load;
- filter by genre and year on the Discover tab and confirm results narrow;
- navigate into a title and back, and confirm the loaded list is still there;
- open a trailer from a detail page and switch between trailers in the dialog;
- edit a Collection in two tabs and confirm the conflict message preserves input.

## Phase 1 — shadcn migration

Install missing components through the shadcn CLI and commit them unmodified
before any customization. Convert the eight raw-element files. Adopt shadcn
`field` in `CollectionForm` and retire `TextField`. Delete the dead
`Filter`/`Sort`/`Genre`/`queryParamsAtom` cluster. Create `docs/BACKLOG.md` and
seed it with the deferred items from this plan's non-goals.

No behavior changes. Every diff in this phase is markup and imports.

## Phase 2 — Catalog API: categories and genres

Add `category` to `catalogDiscoverSchema` and route it to TMDB's named endpoints
in `TmdbCatalogProvider`. Add `getGenres` to the provider interface, the service,
the controller, and `GET /api/catalog/genres`. Integration tests cover category
routing, genre retrieval, cache separation between categories, and rejection of
unknown category values.

## Phase 3 — Catalog web: categories, infinite scroll, filters

Add the Discover entry to `MOVIE_DISCOVER`/`TV_DISCOVER` and render
`CatalogFilters` only on that tab. Convert `useDiscover` to
`useInfiniteDiscover` and wire `useInfiniteScroll` in `MovieByDiscover` and
`TvByDiscover`. Wire the genre multi-select, `year`, and `rating`. Remove
`?page=` from catalog URLs. Add scroll restoration on back-navigation, replacing
the unconditional `goToTop()` in `MoviesPage` and `TVsPage`.

## Phase 4 — Infinite scroll: search and Collection discovery

Replace `SearchPage`'s prev/next pager with infinite scroll and drop `?page=`
from search URLs. Replace `CollectionDiscoveryPage`'s hardcoded `page: 1` with
`useInfiniteDiscovery`.

## Phase 5 — Trailer presentation

Change the detail-page trailer button to `Watch Trailer` /
`Watch Trailers · N available`. Add `formatMediumDate` to
`shared/utils/formatDate.ts` and render the publish date on each row of the
`TrailerDialog` sidebar alongside the official/unofficial label.

## Phase 6 — Collection UI

Remove the version subtitle, Reload button, and conflict paragraph from
`CollectionPage`; replace the conflict toast with an input-preserving message.
Add the "Set as cover" action, the mosaic fallback, and artwork on
`CollectionListPage` cards. Convert `CollectionItems`' manual search button to a
debounced `command` palette. Render visibility as a badge and show `likeCount` on
owner cards.
