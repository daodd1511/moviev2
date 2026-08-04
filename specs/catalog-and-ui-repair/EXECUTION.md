# Catalog and UI Repair — Execution Plan

Spec: [PLAN.md](PLAN.md). Rulebook: `specs/RULEBOOK.md`.
Integration branch: `feature/product-capability-roadmap` (per PLAN.md → "Context"; the
catalog regression never reached `main`). Branch model: stacked (default).

## STATUS

- Current phase: 1 — pending
- Phase 1 — shadcn migration: pending
- Phase 2 — Catalog API: categories and genres: pending
- Phase 3 — Catalog web: categories, infinite scroll, filters: pending
- Phase 4 — Infinite scroll: search and Collection discovery: pending
- Phase 5 — Trailer presentation: pending
- Phase 6 — Collection UI: pending
- Verification debt: none

## Phase 1 — shadcn migration

Branch: `catalog-and-ui-repair/phase-1-shadcn-migration` (off
`feature/product-capability-roadmap`)

Pure refactor with no behavior change; every later phase builds on the resulting component
vocabulary, so it lands first (per PLAN.md → "The migration lands before the catalog work").

Produces: shadcn primitives at `@/components/ui/{checkbox,switch,field,tabs,card,badge,skeleton,slider,separator}`;
`shared/components/ui/TextField.tsx` removed.

- [x] Install missing primitives with `pnpm dlx shadcn@latest add checkbox switch tabs card badge skeleton slider separator field`; commit the generated files in `apps/web/src/components/ui/` unmodified, with `pnpm-lock.yaml` and `apps/web/package.json` in the same commit if the CLI adds dependencies — **(amended 2026-08-04)**: `radix-nova` (this project's shadcn style) has no `form.tsx` (`FormField`/`FormItem`/`FormMessage`) registry entry — it ships `field.tsx` (`FieldSet`/`FieldLabel`/`FieldError`) instead, which takes an `errors` array shaped like RHF's `formState.errors` and needs no `Controller` wrapper. Installed `field` in place of `form`; no new dependencies were added. Commit `7a40580`.
- [x] Convert `features/Library/components/LibraryFilters.tsx` (16 raw elements) to `@/components/ui/{select,label}` — **(amended 2026-08-04)**: Radix `Select` uses `onValueChange(value: string)` and rejects an empty-string item value, so filter "all"/"any" states map to sentinel values (`"all"`, `"any"`) translated to `undefined` at the boundary. Also updated `features/Library/pages/LibraryPage.test.tsx`, which asserted `toHaveValue()` on the native `<select>` — Radix's trigger is a button, not a form control, so the assertions now check the rendered label text (`toHaveTextContent`) instead of the raw value.
- [x] Convert `features/Library/components/LibraryEntryEditor.tsx` (16) to `@/components/ui/{select,label,input,textarea}`
- [x] Convert `shared/components/Filter/CatalogFilters.tsx` (9) to `@/components/ui/{select,label,input}` — behavior unchanged here; Phase 3 rewrites it
- [x] Convert `features/Collection/components/Collaborators.tsx` (6) to `@/components/ui/{select,label,input}` — **(amended 2026-08-04)**: jsdom has no `hasPointerCapture`/`setPointerCapture`/`releasePointerCapture`/`scrollIntoView`, which Radix `Select` calls unconditionally on open; added a shared polyfill to `apps/web/src/test/setup.ts` rather than per-test, since every future shadcn `Select` usage needs it. `Collaborators.test.tsx`'s `user.selectOptions(...)` calls (native-select-only) replaced with click-trigger-then-click-option.
- [x] Convert `features/CollectionDiscovery/pages/CollectionDiscoveryPage.tsx` (4) to `@/components/ui/{select,label}`
- [x] Convert `features/User/pages/ProfilePage.tsx` (3) to `@/components/ui/{label,checkbox}` — no test file exists for this page
- [ ] Convert `features/Collection/components/CollectionItems.tsx` (1) to `@/components/ui/input`
- [ ] Convert `features/Collection/components/CollectionForm.tsx` to shadcn `field` (`Field`/`FieldLabel`/`FieldError`) **(amended 2026-08-04, see above)**, keeping its existing `useForm`/`zodResolver` wiring
- [ ] Delete `shared/components/ui/TextField.tsx` and its remaining importers' references
- [ ] Delete `shared/components/Filter/{index,Sort,Genre}.tsx` and `stores/atoms/queryParamsAtom.ts` (zero live importers; per PLAN.md → "Resolved implementation choices")
- [ ] Delete `MovieQueries.useGenres` and `TvQueries.useGenres` in `stores/queries/{movieQueries,tvQueries}.ts`, orphaned by the previous item
- [ ] Create `docs/BACKLOG.md` and seed it with PLAN.md's non-goals: DnD reorder, Library/Collection-items server pagination, the `shared/components/ui` sweep

**Agent gate (hard):**
- [ ] `pnpm format:check && pnpm lint`
- [ ] `pnpm typecheck` (project-wide)
- [ ] `pnpm test:unit` — full suite; this phase deletes shared components and atoms, so the import graph understates the blast radius
- [ ] `pnpm build`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**
- [ ] Library filters, Library entry editor, and Profile settings still apply and persist their values
- [ ] Collection create and edit forms still show validation errors on invalid input
- [ ] No visual regression against `DESIGN.md` tokens on the converted screens

## Phase 2 — Catalog API: categories and genres

Branch: `catalog-and-ui-repair/phase-2-catalog-api-categories` (off
`catalog-and-ui-repair/phase-1-shadcn-migration`, stacked)

Server capability the web layer cannot be written against until it exists.

Consumes: nothing from Phase 1.
Produces: `CatalogProvider.discover({ mediaType, category?, page, ...filters })`,
`CatalogProvider.getGenres({ mediaType })`, `GET /api/catalog/genres?mediaType=`,
`GET /api/catalog/discover?category=`.

- [ ] Add optional `category` to `catalogDiscoverSchema` in `apps/api/src/validation/catalog.schema.js`, validated against `mediaType` with `superRefine` — movie accepts `popular|top_rated|upcoming|now_playing`, tv accepts `popular|top_rated|on_the_air|airing_today`; a flat enum would admit `mediaType=movie&category=on_the_air`
- [ ] Add `catalogGenresSchema` (`{ mediaType }`, `.strict()`) to the same file
- [ ] Declare `getGenres` on `apps/api/src/catalog/catalogProvider.js`
- [ ] In `apps/api/src/catalog/tmdbCatalogProvider.js`, branch `discover` to `/${type}/${category}` when `category` is present and `/discover/${type}` otherwise; add `getGenres` calling `/genre/${type}/list`
- [ ] Add `getGenres: input => cached('getGenres', input)` to `apps/api/src/service/catalogService.js`
- [ ] Add `CatalogController.getGenres` in `apps/api/src/controller/catalog.controller.js` and route `GET /genres` in `apps/api/src/router/catalog.routes.js` — unauthenticated, matching the other catalog routes
- [ ] Extend `apps/api/test/catalog.integration.test.js`: category routes to the named TMDB endpoint, `/discover` when absent, mismatched category+mediaType rejected 400, genres returned, and `CatalogCache` keying two categories separately

**Agent gate (hard):**
- [ ] `pnpm format:check && pnpm lint`
- [ ] `pnpm typecheck` (project-wide)
- [ ] `pnpm check:api`
- [ ] `pnpm test:unit` — full suite; this phase changes the shared `CatalogProvider` interface
- [ ] `pnpm build`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**
- [ ] `curl '<api>/api/catalog/discover?mediaType=movie&category=top_rated'` returns different titles than `category=popular`
- [ ] `curl '<api>/api/catalog/genres?mediaType=tv'` returns a genre list

## Phase 3 — Catalog web: categories, infinite scroll, filters

Branch: `catalog-and-ui-repair/phase-3-catalog-web-browse` (off
`catalog-and-ui-repair/phase-2-catalog-api-categories`, stacked)

The regression fix; needs Phase 2's endpoints and Phase 1's components in place.

Consumes: `GET /api/catalog/discover?category=`, `GET /api/catalog/genres` (Phase 2);
`@/components/ui/{select,label,input,slider,tabs}` (Phase 1).
Produces: `CatalogQueries.useInfiniteDiscover(input)`, `CatalogQueries.useGenres(mediaType)`.

- [ ] Add `category` and a `Genre` shape to `models/catalog-query.model.ts`, `api/dtos/catalog.dto.ts`, and `api/mappers/catalog.mapper.ts`
- [ ] Add `getGenres(mediaType)` and `category` passthrough to `api/services/catalogService.ts`
- [ ] Replace `CatalogQueries.useDiscover` with `useInfiniteDiscover` (`useInfiniteQuery`, `getNextPageParam` from `page`/`totalPages`) and add `useGenres` in `stores/queries/catalogQueries.ts`
- [ ] Add `{ name: 'Discover', value: 'discover' }` to `MOVIE_DISCOVER` and `TV_DISCOVER` in `shared/constants/discover.ts`
- [ ] Rewrite `shared/components/Filter/CatalogFilters.tsx`: genre multi-select fed by `useGenres`, `year` → `primary_release_date.gte`/`.lte` (movie) or `first_air_date.gte`/`.lte` (tv), `rating` → `vote_average.gte`; drop the `page` deletion, now dead
- [ ] In `features/Movie/components/MovieByDiscover.tsx` and `features/Tv/components/TvByDiscover.tsx`: pass `category` from the route param, render `CatalogFilters` only when it is `discover`, wire `shared/hooks/useInfiniteScroll.ts` to `fetchNextPage`, and render `data.pages`
- [ ] Remove `?page=` handling from both components
- [ ] Replace the unconditional `goToTop()` in `features/Movie/pages/MoviesPage.tsx` and `features/Tv/pages/TVsPage.tsx` with scroll restoration that only resets on category or filter change
- [ ] Add component tests for category switching and filter-visibility-by-tab

**Agent gate (hard):**
- [ ] `pnpm format:check && pnpm lint`
- [ ] `pnpm typecheck` (project-wide)
- [ ] `pnpm test:unit` — full suite; this phase changes shared catalog models, mappers, and constants
- [ ] `pnpm build`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**
- [ ] Switching Popular → Top Rated → Upcoming changes the grid contents, not only the heading
- [ ] Scrolling a catalog grid past the first page loads more titles
- [ ] Filters appear only on the Discover tab; genre, year, and minimum rating each narrow results
- [ ] Opening a title and going back leaves the loaded list and scroll position intact

## Phase 4 — Infinite scroll: search and Collection discovery

Branch: `catalog-and-ui-repair/phase-4-infinite-scroll-search-discovery` (off
`catalog-and-ui-repair/phase-3-catalog-web-browse`, stacked)

Applies Phase 3's pattern to the two remaining server-paginated lists.

Consumes: `shared/hooks/useInfiniteScroll.ts` wiring pattern (Phase 3).
Produces: `CatalogQueries.useInfiniteSearch(query, type)`,
`SocialQueries.useInfiniteDiscovery({ sort, limit })`.

- [ ] Add `useInfiniteSearch` to `stores/queries/catalogQueries.ts`
- [ ] Replace the prev/next pager in `features/Search/pages/SearchPage.tsx` with `useInfiniteSearch` + `useInfiniteScroll`, and drop `page` from its search params
- [ ] Add `useInfiniteDiscovery` to `stores/queries/socialQueries.ts`
- [ ] Replace the hardcoded `page: 1` in `features/CollectionDiscovery/pages/CollectionDiscoveryPage.tsx` with `useInfiniteDiscovery` + `useInfiniteScroll`
- [ ] Update `features/CollectionDiscovery/pages/CollectionDiscoveryPage.test.tsx` and `features/Search/pages/SearchPage.test.tsx` for the paged shape

**Agent gate (hard):**
- [ ] `pnpm format:check && pnpm lint`
- [ ] `pnpm typecheck` (project-wide)
- [ ] `pnpm exec vitest related --run <changed files from the phase diff>`
- [ ] `pnpm build`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**
- [ ] Searching and scrolling loads further results with no pager buttons
- [ ] Collection discovery loads past its first 20 results

## Phase 5 — Trailer presentation

Branch: `catalog-and-ui-repair/phase-5-trailer-presentation` (off
`catalog-and-ui-repair/phase-4-infinite-scroll-search-discovery`, stacked)

Self-contained presentation change on the detail pages; no data or query work.

Produces: `formatMediumDate(date: string): string` from `shared/utils/formatDate.ts`.

- [ ] Add `formatMediumDate` to `shared/utils/formatDate.ts` returning `Aug 3, 2026`, using that module's existing `toLocaleDateString` idiom — not a direct `Intl.DateTimeFormat` call (per PLAN.md → "Resolved implementation choices")
- [ ] Change the trailer button label in `features/Movie/components/Detail/components/Content.tsx` and `features/Tv/components/Detail/components/Content.tsx` from `Trailers · N` to `Watch Trailer` / `Watch Trailers · N available`
- [ ] Render `formatMediumDate(trailer.publishedAt)` beside the official/unofficial label on each sidebar row in `shared/components/ui/TrailerDialog.tsx`
- [ ] Add a unit test for `formatMediumDate`

**Agent gate (hard):**
- [ ] `pnpm format:check && pnpm lint`
- [ ] `pnpm typecheck` (project-wide)
- [ ] `pnpm test:unit` — full suite; `shared/utils/formatDate.ts` is a shared utility
- [ ] `pnpm build`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**
- [ ] A title with one trailer reads `Watch Trailer`; a title with several reads `Watch Trailers · N available`
- [ ] The dialog sidebar shows a readable publish date per trailer and switching between them still works

## Phase 6 — Collection UI

Branch: `catalog-and-ui-repair/phase-6-collection-ui` (off
`catalog-and-ui-repair/phase-5-trailer-presentation`, stacked)

Web-only; `cover` is already complete on the API write path (`model/collection.js`,
`validation/collection.schema.js`, `dto/collection.dto.js`), so nothing here needs a server
change. Kept as one phase because its four chunks share the same three files.

Consumes: `@/components/ui/{field,badge,card,command}` (Phase 1).

- [ ] Remove the `Version {n}` subtitle, the `Reload` button, and the conflict paragraph from `features/Collection/pages/CollectionPage.tsx`; retitle away from "Edit Collection"
- [ ] Replace the conflict toast in `handleUpdate`/`handleDelete` with an input-preserving message: refetch, keep form values, report that the Collection changed elsewhere and was not saved — no auto-retry (per PLAN.md → "Optimistic locking stops leaking into the Collection UI")
- [ ] Add a "Set as cover" action per item in `features/Collection/components/CollectionItems.tsx`, writing `cover` through `CollectionQueries.useUpdate`
- [ ] Add a cover renderer to `features/Collection/pages/CollectionListPage.tsx`: `collection.cover`, else a mosaic of the first four item posters, else the first item's poster
- [ ] Replace the manual search button in `CollectionItems` with a debounced `@/components/ui/command` palette over `SearchService.multi`
- [ ] Render `collection.visibility` as a `badge` with human copy and show `collection.likeCount` on `CollectionListPage` cards
- [ ] Update `features/Collection/pages/CollectionPage.test.tsx` for the removed version surface and the new conflict message

**Agent gate (hard):**
- [ ] `pnpm format:check && pnpm lint`
- [ ] `pnpm typecheck` (project-wide)
- [ ] `pnpm exec vitest related --run <changed files from the phase diff>`
- [ ] `pnpm build`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**
- [ ] Collection cards show artwork; a Collection with 4+ items shows a mosaic
- [ ] "Set as cover" changes the card artwork
- [ ] Editing the same Collection in two tabs shows the conflict message and preserves typed input
- [ ] Adding a title works by typing, with no separate Search button
- [ ] No "Version", "Reload", or conflict explanation appears anywhere on the page

**On completion (all phases):** run local agent gate, update STATUS + checkboxes, stop and
ask before push/PR; after the PR opens, watch CI and fix red before marking the phase done.
Review checklist goes into the PR description.
