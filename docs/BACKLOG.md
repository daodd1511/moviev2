# Backlog

Single inbox for fixes, features, and ideas. One line per item:
`- [ ] <description> (<date captured>)`. Delete a line when it ships or graduates
into a `specs/<feature>/` plan.

## Fixes

- [ ] `MovieService.getTestMovies` (`apps/web/src/api/services/movieService.ts`) and
  `TvService.getTvsByGenre` (`apps/web/src/api/services/tvService.ts`) have zero
  callers — their hooks were dropped in the product-capability-roadmap's Phase 15
  cleanup, but the service methods themselves were missed (2026-08-04)

## Features

- [ ] Drag-and-drop reorder for Collection items, replacing the current
  move-up/move-down buttons — deferred from `catalog-and-ui-repair` PLAN.md, needs
  its own grill (touch/keyboard-accessible fallbacks, recovery from a mid-drag
  version conflict) (2026-08-04)
- [ ] Server-side pagination for the Library (`GET /api/library/entries`) and for
  Collection items — neither paginates today; not broken at current data volumes,
  but will be at scale (2026-08-04)

## Ideas

- [ ] Sweep `shared/components/ui/` for shadcn equivalents: `MultiSelect` →
  `command`+`popover`, `ConfirmDialog` → `alert-dialog`, `Chip` → `badge` — deferred
  from `catalog-and-ui-repair` to avoid churning components other in-flight phases
  depend on (2026-08-04)
