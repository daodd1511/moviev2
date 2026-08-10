# TV Season Episode Ledger

Written 2026-08-10 for the `moviev2` repository.

## Outcome

Turn the existing non-interactive season rail on TV detail pages into a path to a
dedicated, shareable season screen. The screen uses the selected Episode Ledger prototype
to present an ordered, compact list of episodes with public TMDB ratings and the metadata
needed to compare episodes quickly.

After the season ledger ships, add a dedicated series-quality overview that loads every
regular season and visualizes episode ratings as an interactive cross-season matrix. This
work is appended after the ledger so the core season experience remains independently
shippable.

Design references:
[`docs/prototypes/tv-season-detail/variant-b-ledger.html`](../../docs/prototypes/tv-season-detail/variant-b-ledger.html).
[`docs/prototypes/tv-quality-overview/variant-a-matrix.html`](../../docs/prototypes/tv-quality-overview/variant-a-matrix.html).

## Context

The TV detail response already includes seasons, and
`features/Tv/components/Detail/components/Seasons.tsx` renders them as poster cards. Those
cards are non-interactive.

The web data layer already calls TMDB's `/tv/:id/season/:seasonNumber` endpoint through
`TvService.getSeasonDetail` and `TvQueries.useSeasonDetail`, but it reduces the response to
an episode array that contains only air date, id, name, overview, and episode number. No UI
consumes that query. The response fields required by the feature—season metadata, episode
runtime, still path, and vote average—are discarded at the DTO/mapper boundary.

This remains a web-side TMDB read path, matching the existing TV detail implementation. It
does not broaden the feature into a migration to the server-side catalog provider.

## Non-goals

- personal episode ratings or any authenticated write workflow;
- watched/unwatched episode tracking or Library progress changes;
- a dedicated episode-detail route;
- vote-count display;
- changing TMDB as the catalog source or proxying this existing TV path through the API;
- redesigning the TV show detail hero, cast rail, or recommendations;
- user-configurable quality thresholds or color palettes;
- server-side persistence, precomputation, or caching of series-quality metrics.

## Decisions

### A season is a dedicated route

Each season card links to `/tv/:tvId/season/:seasonNumber`. The URL is shareable and keeps
long episode lists out of the TV show detail page. The season selector and previous/next
controls navigate between these URLs rather than holding the selected season only in local
state.

Season 0 remains visible and is labeled **Specials**. Numbered seasons retain their TMDB
order.

### The Episode Ledger prototype is binding

The selected visual direction is prototype 2:
`docs/prototypes/tv-season-detail/variant-b-ledger.html`. Desktop rows use the compact
number / still / episode / air date / rating hierarchy. The layout collapses below the
existing 860px design breakpoint without horizontal page overflow.

Every row shows:

- episode number;
- 16:9 still;
- title;
- overview clamped to two lines, with no expansion control;
- air date;
- runtime when available;
- public TMDB vote average, rounded for display to one decimal.

Rows are semantic list items, not links or buttons. There is no episode-detail destination.

### Missing metadata stays explicit

Upcoming and incomplete episodes remain in sequence. A missing air date renders **Not yet
aired**, a missing or zero vote average renders **Not rated**, a missing runtime is omitted,
and a missing still uses `/images/no-image.png`.

Empty seasons render a clear no-episodes state instead of an empty ledger. Query failures
render a retry action. Loading uses the existing `Loader` component.

### TMDB rating and personal rating stay separate

The domain field is named `voteAverage`, mirroring the public TMDB aggregate and avoiding
confusion with a user's Library Entry rating. `vote_average <= 0` maps to `null`; the UI
never treats zero as a real rating. Vote count is not mapped because the agreed UI does not
consume it.

### Series quality is appended after the ledger

The series-quality overview lives at `/tv/:id/quality` and is linked from both the TV detail
page and every season-detail page. It is not embedded into either page because a wide
cross-season matrix would dominate their existing content hierarchy.

The selected design is
`docs/prototypes/tv-quality-overview/variant-a-matrix.html`: season columns, episode-position
rows, numeric rating cells, a fixed quality-band legend, and an in-place episode inspector.

### The matrix loads the complete show

All numbered seasons are requested immediately and shown in the matrix. This deliberately
accepts one season-detail request per season so the first completed view represents the
whole regular series rather than an arbitrary five-season window. Existing TanStack Query
keys are reused, so seasons already visited in the ledger remain cached.

Season 0 is excluded by default and fetched when **Show Specials** is enabled. The toggle
appears only when the TV detail response contains Season 0.

One failed season does not fail the page. Successful columns remain usable, the failed
season renders an unavailable column with its own retry action, and a full-page retry state
appears only when the TV detail request fails or every requested season fails.

### Quality bands are fixed data semantics

Episode vote averages map to:

- Awesome: `9.0–10`;
- Great: `8.0–8.9`;
- Good: `7.0–7.9`;
- Regular: `6.0–6.9`;
- Bad: `5.0–5.9`;
- Garbage: below `5.0`;
- Not rated: `voteAverage === null`.

Every rated cell contains its one-decimal value, so color is never the only signal. An
existing but unrated episode renders `?`; a position beyond that season's episode count
renders `—`. A failed season column is labeled unavailable rather than reusing either
missing-data symbol.

### Matrix selection stays in context

Selecting a rated cell updates an adjacent episode inspector with season/episode number,
rating band, title, rating, and comparison against its season average. The inspector links
to `/tv/:id/season/:seasonNumber#episode-:episodeNumber`; ledger rows receive matching ids
but remain non-interactive.

The TV show header labels both aggregates separately: **Series rating** is
`TvDetail.voteAverage`, while **Episode average** is the arithmetic mean of all rated
episodes in successfully loaded, currently visible columns. Specials affect the episode
average only while Show Specials is enabled.

On screens below 860px the matrix remains a matrix inside a horizontal scroller. Season
headers and the episode-number column are sticky; it does not collapse into cards.

### Matrix height fits the review viewport

The episode matrix must not create an independent vertical scroll area. `EpisodeMatrix` uses
the available viewport height to compact episode rows for long seasons while retaining
one-decimal ratings and recognizable quality bands. Once cells reach the readable lower
bound, additional height uses normal document scrolling rather than nested matrix scrolling.
Horizontal overflow remains available only when season columns cannot remain legible.

### Review refinements remain part of the specification

Phase 5 is the explicit review/refinement phase for this feature. Each accepted user review
item is recorded below in **Review Decisions** with its observed behavior, implementation
files, focused verification, and resulting product decision. The affected requirement in
**Spec Delta** is then updated with its complete post-change text; rejected observations are
recorded as decisions without code changes. This keeps the final specification aligned with
the reviewed product rather than only the initial prototype.

## Review Decisions

### 2026-08-10 — Fit long-season rows without nested vertical scrolling

Observed: a long season makes the quality matrix internally scrollable, interrupting
comparison across the whole season.

Decision: compact rows to the available viewport height, remove internal vertical overflow,
and retain horizontal overflow only for column legibility.

Implementation: `apps/web/src/features/Tv/components/SeriesQuality/EpisodeMatrix.tsx`,
`apps/web/src/features/Tv/pages/SeriesQualityPage.test.tsx`.

Verification: `SeriesQualityPage.test.tsx` covers a 16-episode season, compact density, and
the absence of the former nested vertical-scroll constraint.

### 2026-08-10 — Use Shadcn controls for season selection and Specials

Observed: Season detail uses a native `select` and Series quality uses a native checkbox,
despite Shadcn Select and Checkbox components already being part of the application.

Decision: use the shared Shadcn Select for season navigation and the shared Shadcn Checkbox
for Show Specials. Preserve the existing labels, keyboard behavior, route navigation, and
on-demand Specials loading.

Implementation: `apps/web/src/features/Tv/components/SeasonDetail/SeasonHero.tsx`,
`apps/web/src/features/Tv/components/SeriesQuality/QualityHero.tsx`,
`apps/web/src/features/Tv/pages/SeasonDetailPage.test.tsx`,
`apps/web/src/features/Tv/pages/SeriesQualityPage.test.tsx`.

Registry: `pnpm dlx shadcn@latest add select checkbox --yes` verified the Shadcn registry;
the CLI found both local components and safely declined to overwrite them.

Verification: the season-detail and series-quality page suites verify Shadcn registry data
slots, Season 0 navigation, and on-demand Specials loading.

### 2026-08-10 — Refine both TV detail experiences as a noir field guide

Observed: the Season Detail and Series Quality pages are functional but lack a shared visual
language strong enough to support repeated scanning across long episode lists and matrices.

Decision: refine both pages into a restrained noir technical field guide: ruled surfaces,
calibrated metadata, deliberate score modules, and high-contrast focus states. Preserve every
route, loading/error state, responsive matrix rule, and accessible interactive control.

Implementation: `apps/web/src/features/Tv/components/SeasonDetail/{SeasonDetail,SeasonHero,EpisodeLedger}.tsx`,
`apps/web/src/features/Tv/components/SeriesQuality/{QualityHero,EpisodeMatrix,EpisodeInspector,QualityLegend,SeriesQuality}.tsx`.

Verification: retain the Season Detail and Series Quality page behavior suites; visual
verification is recorded in the Phase 5 review checklist.

Result: no route, interaction, or data-semantic change was introduced; `SeasonDetailPage` and
`SeriesQualityPage` behavior suites pass after the visual refinement.

### 2026-08-10 — Consolidate the season navigation dock

Observed: the season navigation rail stretches into an empty full-width surface while the
Series quality and previous/next actions float beside it, weakening the visual hierarchy.

Decision: compose season context, quality navigation, and season stepping into one compact
navigation dock. The dock may wrap on small screens but must retain the labeled Shadcn Select,
accessible quality link, and previous/next buttons.

Implementation: `apps/web/src/features/Tv/components/SeasonDetail/SeasonHero.tsx`.

Verification: retain the Season Detail route-navigation test and visually inspect the dock at
desktop and mobile widths through the Phase 5 review checklist.

Result: the Shadcn season selector and all three navigation actions remain in the same
accessible control group; `SeasonDetailPage.test.tsx` route-navigation coverage passes.

### 2026-08-10 — Make show detail an explicit season action

Observed: the only route back to the TV detail page is the small breadcrumb link, so it is
not discoverable as primary season navigation.

Decision: add a labeled Show details action to the SeasonHero navigation dock. It targets
`/tv/:id` and sits alongside Series quality and season stepping; keep the breadcrumb as a
secondary orientation cue.

Implementation: `apps/web/src/features/Tv/components/SeasonDetail/SeasonHero.tsx`,
`apps/web/src/features/Tv/pages/SeasonDetailPage.test.tsx`.

Verification: `SeasonDetailPage.test.tsx` asserts the explicit Show details link and its
`/tv/42` destination alongside the Series quality route.

### 2026-08-10 — Center and space the season navigation dock

Observed: the compact dock is left-aligned within the content column, and the Show details
and Series quality icon-text pairs lack sufficient breathing room.

Decision: center the dock horizontally beneath the hero. Give both labeled route actions a
consistent icon-to-label gap at the desktop breakpoint while retaining compact icon-only
controls on small screens.

Implementation: `apps/web/src/features/Tv/components/SeasonDetail/SeasonHero.tsx`.

Verification: retain `SeasonDetailPage.test.tsx` navigation coverage; visual spacing and
centered alignment are included in the Phase 5 review checklist.

## Data Changes

Extend `apps/web/src/api/dtos/tv/episode.dto.ts` with nullable `air_date`, `runtime`,
`still_path`, and `vote_average`. Extend `apps/web/src/models/tv/episode.model.ts` and
`apps/web/src/api/mappers/tv/episode.mapper.ts` with:

- `airDate: string | null`;
- `runtime: number | null`;
- `stillPath: string | null`;
- `voteAverage: number | null`.

Add `apps/web/src/api/dtos/tv/seasonDetail.dto.ts`,
`apps/web/src/models/tv/seasonDetail.model.ts`, and
`apps/web/src/api/mappers/tv/seasonDetail.mapper.ts`. `SeasonDetail` contains season id,
name, overview, nullable air date and poster path, season number, and
`episodes: readonly Episode[]`.

Update the DTO, mapper, and model barrels. Change:

- `TvService.getSeasonDetail(tvId, seasonNumber): Promise<SeasonDetail>`;
- `TvQueries.useSeasonDetail(id, seasonNumber)` to query `SeasonDetail` with key
  `['tvSeasonDetail', id, seasonNumber]`.

Invalid route parameters are rejected by the page before invoking the query; the service no
longer returns an unsafe cast for missing identifiers.

After the season contract exists, refactor `apps/web/src/stores/queries/tvQueries.ts` to
expose reusable season query options and add:

- `TvQueries.useSeasonDetails(id: number, seasonNumbers: readonly number[])`, implemented
  with TanStack `useQueries` and the same `['tvSeasonDetail', id, seasonNumber]` keys as the
  single-season hook.

Add `apps/web/src/features/Tv/utils/seriesQuality.ts` with:

- `QualityBand` and `QUALITY_BANDS`;
- `getQualityBand(voteAverage: number | null): QualityBand | 'notRated'`;
- `calculateEpisodeAverage(seasons: readonly SeasonDetail[]): number | null`;
- `buildEpisodeMatrix(seasons: readonly SeasonDetail[]): readonly EpisodeMatrixRow[]`, whose
  discriminated cells distinguish rated, not-rated, and nonexistent episode positions.

## Frontend Changes

- Change `features/Tv/components/Detail/components/Seasons.tsx` cards from inert containers
  to semantic `Link` elements targeting `/tv/:tvId/season/:seasonNumber`; add `tvId` to its
  props and pass `tv.id` from `features/Tv/components/Detail/Detail.tsx`.
- Add lazy `SeasonDetailPage` routing in `features/Tv/routes.tsx` at
  `tv/:id/season/:seasonNumber`.
- Add `features/Tv/pages/SeasonDetailPage.tsx` as the route boundary and
  `features/Tv/components/SeasonDetail/SeasonDetail.tsx` as the query/state coordinator.
- Add `features/Tv/components/SeasonDetail/SeasonHero.tsx` for the season heading, TV show
  breadcrumb, poster/backdrop treatment, selector, and previous/next navigation. It consumes
  the existing `TvQueries.useDetail(tvId)` result plus the selected `SeasonDetail`.
- Add `features/Tv/components/SeasonDetail/EpisodeLedger.tsx` for the responsive semantic
  episode list and missing-data fallbacks.
- Use `BackdropSizes.medium` for episode stills; no new image-size enum is needed because
  TMDB still sizes share the backdrop size vocabulary.
- Use the existing `formatMediumDate` for non-null air dates, `Loader` for pending state,
  `NotFound` for invalid route parameters, and a retryable error state for failed TV or
  season queries.
- Add lazy `SeriesQualityPage` routing in `features/Tv/routes.tsx` at `tv/:id/quality`.
- Add `features/Tv/pages/SeriesQualityPage.tsx` as the route boundary and
  `features/Tv/components/SeriesQuality/SeriesQuality.tsx` as the multi-query/state
  coordinator.
- Add `features/Tv/components/SeriesQuality/QualityHero.tsx` for the TV identity, separately
  labeled series rating and episode average, and Show Specials control.
- Add `features/Tv/components/SeriesQuality/{QualityLegend,EpisodeMatrix,EpisodeInspector}.tsx`
  for the fixed thresholds, sticky responsive grid, selectable cells, per-season retry
  columns, and deep link to the ledger.
- Update `features/Tv/components/SeriesQuality/EpisodeMatrix.tsx` so long seasons compact
  rows to the viewport without an internal vertical scroll area; retain horizontal overflow
  only when season columns cannot stay legible.
- Use the shared Shadcn Select in `features/Tv/components/SeasonDetail/SeasonHero.tsx` for
  season navigation and the shared Shadcn Checkbox in
  `features/Tv/components/SeriesQuality/QualityHero.tsx` for Show Specials.
- Add a **Series quality** `Link` in
  `features/Tv/components/Detail/components/Content.tsx` and
  `features/Tv/components/SeasonDetail/SeasonHero.tsx`.
- Add an `episode-${episode.episodeNumber}` id to ledger rows in
  `features/Tv/components/SeasonDetail/EpisodeLedger.tsx` so matrix inspector links have a
  stable target.

## Tests

- `api/mappers/tv/episode.mapper.test.ts`: maps runtime/still/date/rating and normalizes a
  zero vote average plus missing metadata to `null`.
- `api/mappers/tv/seasonDetail.mapper.test.ts`: maps season metadata and its ordered episode
  array.
- `features/Tv/components/Detail/components/Seasons.test.tsx`: season cards link to the
  expected dedicated route, including `/season/0` for Specials.
- `features/Tv/pages/SeasonDetailPage.test.tsx`: loading, failure/retry,
  invalid parameters, empty episodes, season navigation, complete episode rows, one-decimal
  ratings, and missing-data fallbacks.
- `features/Tv/utils/seriesQuality.test.ts`: exact band boundaries, rated/not-rated/no-episode
  matrix cells, regular-season and Specials averages, and empty input.
- `stores/queries/tvQueries.test.tsx`: multi-season query keys, cache reuse with
  `useSeasonDetail`, and independent season failure results.
- `features/Tv/pages/SeriesQualityPage.test.tsx`: route validation, all-season loading,
  Specials toggle, separate aggregates, cell selection/inspector, ledger deep links,
  partial/full failure and retry, matrix missing-position states, and no nested vertical
  matrix scroll for long seasons.

## Open Items

None. Product behavior and scope were confirmed before this plan was written.

## Spec Delta

Capability: `specs/capabilities/tv-catalog.md`

### ADDED Requirement: TV season episode ledger

Origin: delta ← specs/tv-season-episode-ledger

#### Scenario: Open a season from TV detail

**WHEN** a user activates a season card on a TV detail page
**THEN** the app navigates to `/tv/:tvId/season/:seasonNumber`
**AND** Season 0 is represented as Specials without being hidden.

#### Scenario: Change seasons from the season detail page

**WHEN** a user chooses a season from the shared Shadcn Select on a season detail page
**THEN** the app navigates to that season's dedicated URL
**AND** the selected season remains visibly labeled in the control.

#### Scenario: Return to show detail

**WHEN** a user is on a season detail page
**THEN** an explicit Show details action in the navigation dock links to `/tv/:tvId`
**AND** the dock is horizontally centered beneath the hero with consistently spaced labeled
route actions
**AND** the season navigation and Series quality actions remain available.

#### Scenario: Browse a season's episodes

**WHEN** a season detail response contains episodes
**THEN** the app lists them in episode order with number, still, title, two-line overview,
air date, available runtime, and one-decimal public TMDB rating
**AND** episode rows do not navigate to a separate episode page.

#### Scenario: Browse incomplete or upcoming episode metadata

**WHEN** an episode has no air date, still, runtime, or positive vote average
**THEN** the episode remains in sequence
**AND** the app renders Not yet aired, the no-image fallback, no runtime, and Not rated as
applicable.

#### Scenario: Season data is unavailable

**WHEN** the season query is pending, fails, or returns no episodes
**THEN** the app renders respectively the standard loader, an error with retry action, or a
clear no-episodes state.

### ADDED Requirement: TV series quality overview

Origin: delta ← specs/tv-season-episode-ledger

#### Scenario: Open the complete series-quality matrix

**WHEN** a user follows Series quality from a TV or season detail page
**THEN** the app navigates to `/tv/:id/quality`
**AND** loads every numbered season into columns of episode-position rating cells
**AND** labels the TMDB series rating separately from the calculated rated-episode average.

#### Scenario: Interpret matrix cells

**WHEN** the matrix contains rated, unrated, and nonexistent episode positions
**THEN** rated cells show their one-decimal value and fixed named quality band
**AND** unrated episodes show `?`
**AND** positions beyond a season's episode count show `—`.

#### Scenario: Inspect an episode from the matrix

**WHEN** a user selects a rated episode cell
**THEN** the in-page inspector shows its episode identity, rating band, and season-relative
comparison
**AND** offers a link to the matching anchored row on `/tv/:id/season/:seasonNumber`.

#### Scenario: Include Specials on demand

**WHEN** a TV has Season 0 and the user enables Show Specials
**THEN** the app loads and adds the Specials column
**AND** recalculates the episode average to include its rated episodes
**AND** the control is the shared Shadcn Checkbox with an accessible Show Specials label.

#### Scenario: A season fails independently

**WHEN** at least one regular season loads and another fails
**THEN** successful season columns remain usable
**AND** the failed column is labeled unavailable with an independent retry action.

#### Scenario: Compare seasons on a narrow screen

**WHEN** the viewport is narrower than 860px
**THEN** the matrix scrolls horizontally while season headers and episode labels remain
sticky.

#### Scenario: Fit a long season without nested vertical scrolling

**WHEN** a loaded season has more episode rows than the matrix's baseline cell height fits
in the available viewport
**THEN** the matrix compacts rows while keeping one-decimal ratings and quality bands legible
**AND** does not create an internal vertical scroll area
**AND** preserves horizontal overflow only when season columns cannot remain legible.
