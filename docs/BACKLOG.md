# Backlog

Single inbox for fixes, features, and ideas. One line per item:
`- [ ] <description> (<date captured>)`. Delete a line when it ships or graduates
into a `specs/<feature>/` plan.

## Fixes

- [ ] Translucent chrome outside form controls is still on the old `.06` fill / `.09` hover
      (list-row hovers in `SearchResult`/`AddTitlesDialog`, the media-type badges, the `⌘K`
      `kbd`, `ConfirmDialog`, `TrailerDialog`) — form controls moved to `DESIGN.md`'s `.08`/`.16`
      via `lib/fieldStyles.ts`, so these are now the odd ones out (2026-08-07)
- [ ] Under headless Chrome, `/movie/discover/top_rated` and `/movie/discover/discover` both
      render "Popular Movies" — every catalog route resolves to the default category. Unit
      tests at those paths pass, so this may be a headless artifact; needs one check in a real
      browser before it is treated as a routing bug (2026-08-07)
- [ ] `.impeccable/design.json` is stale against `DESIGN.md` (amber rule, type ramp, Logo
      entry) — the design hook has been asking for `/impeccable document` on every edit
      (2026-08-07)

## Features

- [ ] Drag-and-drop reorder for Collection items, replacing the current
      move-up/move-down buttons — deferred from `catalog-and-ui-repair` PLAN.md, needs
      its own grill (touch/keyboard-accessible fallbacks, recovery from a mid-drag
      version conflict) (2026-08-04)
- [ ] Server-side pagination for the Library (`GET /api/library/entries`) and for
      Collection items — neither paginates today; not broken at current data volumes,
      but will be at scale (2026-08-04)
- [ ] Genre pages: a browsable route per genre for movies and TV, beyond the multi-select
      genre filter on the catalog Discover tab (2026-08-05)
- [ ] TV season detail with per-episode ratings, IMDb-style — episode list per season with
      each episode's rating, air date, and still (2026-08-05)

## Ideas

- [ ] Sweep `shared/components/ui/` for shadcn equivalents: `MultiSelect` →
      `command`+`popover`, `ConfirmDialog` → `alert-dialog`, `Chip` → `badge` — deferred
      from `catalog-and-ui-repair` to avoid churning components other in-flight phases
      depend on (2026-08-04)
