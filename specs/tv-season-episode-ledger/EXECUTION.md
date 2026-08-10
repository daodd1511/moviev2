# TV Season Episode Ledger — Execution Plan

Spec: [PLAN.md](PLAN.md). Rulebook: `specs/RULEBOOK.md`.
Integration branch: `dev`. Branch model: stacked via `gh stack` — existing Phase 1 is
adopted as the stack bottom on 2026-08-10.

## STATUS

- Current phase: 3 — in-progress
- Phase 1 — Season data contract: done
- Phase 2 — Routed episode ledger: done
- Phase 3 — Series quality data: in-progress
- Phase 4 — Series quality matrix: pending
- Verification debt: none

## Phase 1 — Season data contract

Branch: `tv-season-episode-ledger/phase-1-season-data` (stacked: `gh stack init --base dev`)

Defines the typed season response that the routed UI depends on without changing visible UI.

Consumes: TMDB `/tv/:id/season/:seasonNumber` response.
Produces: `SeasonDetail`, `SeasonDetailDto`, `SeasonDetailMapper.fromDto(dto): SeasonDetail`,
`TvService.getSeasonDetail(tvId: number, seasonNumber: number): Promise<SeasonDetail>`, and
`TvQueries.useSeasonDetail(id: number, seasonNumber: number)`.

Fresh review: not required

- [x] Extend `apps/web/src/api/dtos/tv/episode.dto.ts`, `apps/web/src/models/tv/episode.model.ts`, and `apps/web/src/api/mappers/tv/episode.mapper.ts` with nullable `airDate`, `runtime`, `stillPath`, and `voteAverage`, mapping non-positive vote averages to `null`
- [x] Add `apps/web/src/api/dtos/tv/seasonDetail.dto.ts`, `apps/web/src/models/tv/seasonDetail.model.ts`, and `apps/web/src/api/mappers/tv/seasonDetail.mapper.ts`; export them from the DTO, model, and mapper barrels
- [x] Change `TvService.getSeasonDetail` in `apps/web/src/api/services/tvService.ts` to require numeric identifiers and return `SeasonDetail`; update `TvQueries.useSeasonDetail` in `apps/web/src/stores/queries/tvQueries.ts` to cache it under `['tvSeasonDetail', id, seasonNumber]`
- [x] Add `apps/web/src/api/mappers/tv/episode.mapper.test.ts` and `apps/web/src/api/mappers/tv/seasonDetail.mapper.test.ts` for complete, nullable, zero-rating, and ordered-episode mappings
- [x] (amended 2026-08-10) Add the required `legacyPublicId` fixture field in `apps/web/src/features/Collection/pages/CollectionListPage.test.tsx` so the project-wide typecheck can verify this phase

**Phase gate (hard):**
- [x] `pnpm typecheck` — passed via the bundled pnpm runtime; configured pnpm shims hung before invocation in this environment
- [x] `pnpm exec vitest related --project web --run <changed files from the phase diff, repo-root-relative>` — passed via the bundled pnpm runtime; 9 files / 21 tests

**Review checklist (user, at PR review):**
- [ ] An existing TV detail page still loads and its season rail remains visually unchanged

**On completion:** run the phase gate; run `fresh-review` when the recorded or actual-diff
decision requires it; update STATUS + checkboxes; stop and ask before push/PR. Review
checklist goes into the PR description.

## Phase 2 — Routed episode ledger

Branch: `tv-season-episode-ledger/phase-2-ledger-ui` (stacked: `gh stack add`)

Consumes Phase 1's season contract and exposes it through the selected responsive route/UI.

Consumes: `SeasonDetail`, `TvService.getSeasonDetail(tvId, seasonNumber)`, and
`TvQueries.useSeasonDetail(id, seasonNumber)` from Phase 1; existing `TvDetail`, `Loader`,
`NotFound`, `formatMediumDate`, `IMAGE_BASE_URL`, and `BackdropSizes.medium`.
Produces: route `/tv/:id/season/:seasonNumber`, `SeasonDetailPage`, `SeasonDetail`,
`SeasonHero`, and `EpisodeLedger` components.

Fresh review: not required

- [x] Add lazy `SeasonDetailPage` and route `tv/:id/season/:seasonNumber` in `apps/web/src/features/Tv/routes.tsx`; validate numeric route params in `apps/web/src/features/Tv/pages/SeasonDetailPage.tsx`
- [x] Add `tvId` to `Seasons` in `apps/web/src/features/Tv/components/Detail/components/Seasons.tsx`, pass `tv.id` from `apps/web/src/features/Tv/components/Detail/Detail.tsx`, and render each season card as a `Link` to its dedicated route
- [x] Add `apps/web/src/features/Tv/components/SeasonDetail/SeasonHero.tsx` with the TV breadcrumb, season artwork/summary, Specials label, native season selector, and URL-backed previous/next controls per PLAN.md → “A season is a dedicated route”
- [x] Add `apps/web/src/features/Tv/components/SeasonDetail/EpisodeLedger.tsx` with the responsive prototype-2 columns, semantic non-interactive rows, two-line overviews, formatted air dates, optional runtimes, one-decimal vote averages, and agreed missing-data fallbacks
- [x] Add `apps/web/src/features/Tv/components/SeasonDetail/SeasonDetail.tsx` to coordinate `TvQueries.useDetail` and `useSeasonDetail`, render `Loader`, retryable error, `NotFound`, empty-season, hero, and ledger states, and restore scroll position to the top when the routed season changes
- [x] Add `apps/web/src/features/Tv/components/Detail/components/Seasons.test.tsx` and `apps/web/src/features/Tv/pages/SeasonDetailPage.test.tsx` for route links, Specials, navigation, complete rows, one-decimal ratings, loading/error/retry, invalid params, empty episodes, and missing-data fallbacks
- [x] Retain `docs/prototypes/tv-season-detail/{index.html,variant-a-cinematic.html,variant-b-ledger.html,variant-c-spotlight.html,prototype.css,prototype.js}` as the design record, with `variant-b-ledger.html` identified as the selected reference

**Phase gate (hard):**
- [x] `pnpm typecheck` — passed via the bundled pnpm runtime; configured pnpm shims hung before invocation in this environment
- [x] `pnpm exec vitest related --project web --run <changed files from the phase diff, repo-root-relative>` — passed via the bundled pnpm runtime; 2 files / 8 tests

**Review checklist (user, at PR review):**
- [ ] From a TV detail page, open a numbered season and Specials and confirm each dedicated URL is correct
- [ ] Change seasons with the selector and previous/next controls and confirm the URL, heading, and ledger all update
- [ ] Confirm complete and upcoming episode rows show the agreed metadata/fallbacks, remain non-clickable, and do not overflow below 860px

**On completion:** run the phase gate; run `fresh-review` when the recorded or actual-diff
decision requires it; update STATUS + checkboxes; stop and ask before push/PR. Review
checklist goes into the PR description.

## Phase 3 — Series quality data

Branch: `tv-season-episode-ledger/phase-3-quality-data` (stacked: `gh stack add`)

Appends reusable multi-season queries and pure matrix calculations after the ledger ships.

Consumes: `SeasonDetail` and `TvQueries.useSeasonDetail(id, seasonNumber)` from Phase 1;
`Season` and the `['tvSeasonDetail', id, seasonNumber]` cache-key contract.
Produces: `TvQueries.seasonDetailOptions(id: number, seasonNumber: number)`,
`TvQueries.useSeasonDetails(id: number, seasonNumbers: readonly number[])`, `QualityBand`,
`QUALITY_BANDS`, `getQualityBand`, `calculateEpisodeAverage`, `EpisodeMatrixRow`, and
`buildEpisodeMatrix`.

Fresh review: not required

- [x] Refactor `apps/web/src/stores/queries/tvQueries.ts` to expose `seasonDetailOptions`, keep `useSeasonDetail` on those options, and add `useSeasonDetails` with TanStack `useQueries` so single- and multi-season reads share cache keys
- [x] Add `apps/web/src/features/Tv/utils/seriesQuality.ts` with the fixed six band thresholds, explicit `notRated` result, rated/not-rated/nonexistent discriminated matrix cells, and rated-episode average calculation per PLAN.md → “Quality bands are fixed data semantics”
- [x] Add `apps/web/src/features/Tv/utils/seriesQuality.test.ts` for exact threshold boundaries, matrix cell kinds, regular/Specials averages, and empty input
- [x] Add `apps/web/src/stores/queries/tvQueries.test.tsx` for multi-season query keys, cache reuse with `useSeasonDetail`, result ordering, and independent season failures

**Phase gate (hard):**
- [ ] `pnpm typecheck`
- [ ] `pnpm exec vitest related --project web --run <changed files from the phase diff, repo-root-relative>`

**Review checklist (user, at PR review):**
- [ ] An existing season-detail URL still loads normally after single- and multi-season queries share options

**On completion:** run the phase gate; run `fresh-review` when the recorded or actual-diff
decision requires it; update STATUS + checkboxes; stop and ask before push/PR. Review
checklist goes into the PR description.

## Phase 4 — Series quality matrix

Branch: `tv-season-episode-ledger/phase-4-quality-matrix` (stacked: `gh stack add`)

Consumes the appended quality data layer and exposes the selected whole-series visualization.

Consumes: Phase 2's `SeasonHero` and `EpisodeLedger`; Phase 3's
`TvQueries.useSeasonDetails`, `QUALITY_BANDS`, `getQualityBand`,
`calculateEpisodeAverage`, and `buildEpisodeMatrix`; existing `TvQueries.useDetail`.
Produces: route `/tv/:id/quality`, `SeriesQualityPage`, `SeriesQuality`, `QualityHero`,
`QualityLegend`, `EpisodeMatrix`, and `EpisodeInspector` components.

Fresh review: not required

- [ ] Add lazy `SeriesQualityPage` and route `tv/:id/quality` in `apps/web/src/features/Tv/routes.tsx`; validate the numeric TV id in `apps/web/src/features/Tv/pages/SeriesQualityPage.tsx`
- [ ] Add Series quality links to `apps/web/src/features/Tv/components/Detail/components/Content.tsx` and `apps/web/src/features/Tv/components/SeasonDetail/SeasonHero.tsx`; add stable `episode-${episode.episodeNumber}` ids in `apps/web/src/features/Tv/components/SeasonDetail/EpisodeLedger.tsx`
- [ ] Add `apps/web/src/features/Tv/components/SeriesQuality/SeriesQuality.tsx` to load every numbered season immediately, fetch Season 0 only while enabled, preserve successful columns on partial errors, expose per-season retry, and use a full-page retry only when TV detail or every regular season fails
- [ ] Add `apps/web/src/features/Tv/components/SeriesQuality/QualityHero.tsx` with TV identity, separately labeled `TvDetail.voteAverage` and calculated episode average, and a Show Specials control only when Season 0 exists
- [ ] Add `apps/web/src/features/Tv/components/SeriesQuality/QualityLegend.tsx` and `EpisodeMatrix.tsx` with numeric/text cell content, six fixed bands, `?` versus `—`, unavailable/retry columns, horizontal mobile scrolling, sticky season headers, and sticky episode labels
- [ ] Add `apps/web/src/features/Tv/components/SeriesQuality/EpisodeInspector.tsx` with in-place cell selection, season-relative comparison, and `/tv/:id/season/:seasonNumber#episode-:episodeNumber` link
- [ ] Add `apps/web/src/features/Tv/pages/SeriesQualityPage.test.tsx` for route validation, all-season loading, Specials toggle, separate aggregates, selection/inspector, anchored ledger links, partial/full failure and retry, and matrix missing-position states
- [ ] Retain `docs/prototypes/tv-quality-overview/{index.html,variant-a-matrix.html,variant-b-scorecards.html,variant-c-trajectory.html,quality.css,quality.js}` as the design record, with `variant-a-matrix.html` identified as the selected reference

**Phase gate (hard):**
- [ ] `pnpm typecheck`
- [ ] `pnpm exec vitest related --project web --run <changed files from the phase diff, repo-root-relative>`

**Review checklist (user, at PR review):**
- [ ] Open Series quality from TV detail and season detail, then confirm every numbered season appears and Series rating remains distinct from Episode average
- [ ] Select rated cells, follow View in Season to the anchored ledger row, and confirm `?`, `—`, quality-band labels, and failed-season retry are distinct
- [ ] Enable Specials and confirm its column appears and changes Episode average; below 860px confirm the matrix scrolls with sticky headers and episode labels

**On completion:** run the phase gate; run `fresh-review` when the recorded or actual-diff
decision requires it; update STATUS + checkboxes; stop and ask before push/PR. Review
checklist goes into the PR description.

## Spec gate (hard — once, before the final phase's PR)

- [ ] `pnpm test:unit`
- [ ] `pnpm build`
