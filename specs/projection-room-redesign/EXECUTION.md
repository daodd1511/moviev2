# Projection Room Redesign — Execution Plan

Spec: [PLAN.md](PLAN.md). Rulebook: `CLAUDE.md` → "Spec-Driven Execution Workflow".
Integration branch: `redesign`. Branch model: **single-branch (user directive 2026-07-24)** —
all phases committed directly on `redesign`, no per-phase branches, no phase PRs. The `CI
green on the phase PR` gate item is therefore not applicable per phase; the local agent gate
(build + lint + detector) is the authoritative verification, and CI runs when `redesign`
itself is eventually PR'd to `main`.
Design authority: root `DESIGN.md` + `docs/design-concepts/concept-a-projection-room.html`
(open in a browser while working). Audit defect list: `docs/design-audit.md`.
No test suite exists in `apps/web`; the agent gate is typecheck/build + lint + the
Impeccable detector. Do not add a test framework as a side quest.

## STATUS

- Current phase: 7 — done. **All phases complete.**
- Phase 0 — deps-and-font: done
- Phase 1 — tokens: done (superseded by Phase 2's Tailwind v4 retheme — index.css/tailwind.config.cjs from Phase 1 no longer exist as such; see Phase 2 for current token source of truth)
- Phase 2 — ui-primitives: done
- Phase 3 — app-shell: done
- Phase 4 — detail-pages: done
- Phase 5 — browse-grids: done
- Phase 6 — auth-user: done
- Phase 7 — cleanup-gates: done
- Verification debt: no live-browser/keyboard/screen-reader pass was performed in any phase
  this session (no browser tool was invoked) — every phase's "Review checklist" lane carries
  this as an open item for the user. Final re-audit: **17/20** (target ≥16, met), a11y **3/4**
  (target ≥3, met). See `docs/design-audit.md` → "Re-audit — After Projection Room Redesign".

## Phase 0 — deps-and-font

Branch: `projection-room-redesign/phase-0-deps` (off `redesign`)

Dependency removal must land before any restyle; nothing downstream may import the old libs.

- [x] Remove `daisyui` + its `tailwind.config.cjs` plugin/`daisyui:{themes:false}` block; remove all four `@fortawesome/*` deps (`apps/web/package.json`)
- [x] Add `lucide-react` + `@fontsource/be-vietnam-pro`; import weights 200/300/400/500/600 in `src/main.tsx`; delete Google Fonts `@import` from `src/index.css` — pinned fontsource to **4.5.8** (v5's `./*.css` exports wildcard is unresolvable by Vite 3's resolver; v4 resolves by file path). Second Google Fonts `@import` also removed from `NotFound.css`.
- [x] Replace every FontAwesome icon and daisyUI class per PLAN.md → "Phase 0" mapping (temporary plain styling; visual polish comes later) — icons→lucide across 9 files; daisyUI `btn/card/menu/dropdown/badge/breadcrumbs/tabs/input-bordered/bg-base-*/text-primary/rounded-box` replaced with plain Tailwind across ~13 files. `ProfileDropdown` given a `useState` toggle to replace daisyUI's focus-driven dropdown.

**Agent gate (hard):**

- [x] `npm run build:web` (root — includes project-wide `tsc`) — passes; tsc clean, vite build OK
- [x] `npm run lint` (root) — passes (project script scopes to `.ts`; `.tsx` type-safety covered by tsc in build)
- [x] `rg -l "daisyui|fortawesome|fonts.googleapis" apps/web` → empty
- [~] CI green on the phase PR — n/a: single-branch directive, no phase PR; local gate is authoritative. CI will run when `redesign` → `main`.

**Review checklist (user, at PR review):**

- [ ] App runs; no missing icons or unstyled explosions beyond expected plainness
- [ ] Pre-existing green-CTA/`text-gray-100` contrast (audit P1 #3) intentionally left as-is for Phase 6

**On completion:** run local agent gate, update STATUS + checkboxes, stop and ask before
push/PR; after the PR opens, watch CI and fix red before marking the phase done. Review
checklist goes into the PR description.

## Phase 1 — tokens

Branch: `projection-room-redesign/phase-1-tokens` (off `projection-room-redesign/phase-0-deps`)

Every later phase consumes these tokens; exact values in PLAN.md → "Phase 1 — Tokens".

- [x] Add `:root` token variables + dark `@layer base` (body ground/text, global `:focus-visible` ring) to `src/index.css`
- [x] Map tokens into `tailwind.config.cjs` (`colors`, `borderRadius`) per PLAN.md snippet; keep `cPrimary`/`autoFit` until Phase 7 — colors added under `theme.extend`; `borderRadius` only adds `md:0.75rem` additively. The two-radius restriction is **deferred to Phase 7** on purpose: overriding the whole radius scale now would strip `rounded-lg/xl/2xl` from every unmigrated page and Phase 0's temp styling.
- [x] Verify token values match `DESIGN.md` frontmatter exactly — all 9 match; confirmed `--color-ground:#041219` + `body{background:var(--color-ground)}` in compiled CSS

**Agent gate (hard):**

- [x] `npm run build:web` — passes
- [x] `npm run lint` — passes
- [~] CI green on the phase PR — n/a per single-branch directive (see header)

**Review checklist (user, at PR review):**

- [ ] Body renders dark ground/light text; unmigrated pages look wrong-but-usable (expected mid-migration)

**On completion:** as Phase 0.

## Phase 2 — ui-primitives

Branch: `projection-room-redesign/phase-2-primitives` (off `…/phase-1-tokens`)

Shared component layer; shell and pages depend on it.

**(amended 2026-07-24) Primitive strategy changed: shadcn/ui via its CLI, not hand-rolled.**
User directive: install and extend shadcn's generated primitives instead of writing
Button/IconButton/Dialog/Dropdown/TextField from scratch. This cascaded into a toolchain
upgrade the user also explicitly requested — see the amended "Stack decision" in PLAN.md:
Tailwind 3.1.8 → **4.3.3** (`@tailwindcss/vite`, CSS-first `@theme`, no `tailwind.config.cjs`),
Vite 3.1.0 → **8.1.5**, `@vitejs/plugin-react` → **6.0.4**, `vite-plugin-checker` → **0.14.5**,
`@types/node`/`@types/react`/`@types/react-dom` bumped to match. ESLint/TypeScript stayed
pinned (8.28 / 4.8.4) — bumping those cascades into a separate flat-config + `@typescript-eslint`
v8 migration that's out of scope here. `apps/web/.npmrc` (`legacy-peer-deps=true`) added
because `vite-plugin-checker`'s optional ESLint peer (`>=9.39.4`) otherwise blocks every
`npm install`/`shadcn add` on the pinned ESLint 8 — the checker's ESLint-checking feature
isn't used (`vite.config.ts` only enables `typescript: true`).

- [x] `npx shadcn@latest init` (template vite, base radix, preset nova) → `components.json`, `src/lib/utils.ts`; then `npx shadcn@latest add button dialog dropdown-menu input label`
- [x] Retheme `src/index.css` `@theme`: Projection Room tokens (ground/surface/line/body/danger/cPrimary) **and** shadcn's semantic slots (background/foreground/card/popover/primary/secondary/muted/accent/destructive/border/input/ring) mapped onto them — single dark world, no `:root`/`.dark` split, no theme toggle. `--color-primary` = amber (`#f5a524`), `--color-accent` = subtle hover surface (`surface-raised`, NOT amber — keeps the Three-Job Amber Rule intact). `--radius-sm/md/lg` all `0.75rem` (two-radius system; pills stay explicit `rounded-full`). Custom non-namespace utilities (`h-withoutNavbar`, `grid-cols-autoFit[-sm]`) via `@utility`.
- [x] `Dialog` = shadcn's Radix-based `Dialog` (**not** native `<dialog>` as PLAN.md originally specified — Radix gives correct focus trap/Esc/`aria-modal` out of the box, matches "extend shadcn" directive better than a hand-rolled native-`<dialog>` wrapper). Migrated all 6 `Modal` call sites (Movie/TV trailer dialogs, Movie/TV full-size-image dialogs, List remove-confirm, ProfileDropdown logout-confirm) to `open`/`onOpenChange` + `DialogContent`/`DialogTitle` (`sr-only` title where no visible heading exists). Deleted `shared/components/Modal.tsx`.
- [x] `Dropdown` = shadcn's Radix-based `DropdownMenu`. Migrated `ProfileDropdown` and the shared `List/Menu.tsx` ("..." add-to-list menu, used by `MediaListItem` + both detail `Content.tsx` files) — the nested "Add to list" panel became a proper `DropdownMenuSub`. `Menu.tsx`'s API changed from parent-controlled `isMenuOpen`/`setIsMenuOpen` to an internal, self-contained `trigger`/`triggerLabel` (Radix owns open state; trigger+content must share one `<DropdownMenu>` tree for positioning) — updated its 3 consumers accordingly. The Navbar mega-menu is untouched here per PLAN.md — Phase 3 rebuilds it from scratch.
- [x] `TextField` = thin composition over shadcn's generated `Input` + `Label`, `useId`-generated id when none is passed (audit P1 #1). Not yet wired into the auth forms — that's Phase 6.
- [x] Restyled `Loader` to `text-primary` (amber) — was `text-cPrimary`.
- [x] Kept as custom compositions (not shadcn primitives — no shadcn equivalent exists): `Chip`, `Kicker`, `PosterPlate`, `FactList`, `Rail`. Retokened to the shadcn slot names (`text-muted-foreground`, `text-foreground`, `border-border`, `hover:border-primary`) instead of the pre-shadcn flat tokens (`text-muted`, `text-body`, `hover:border-accent`) they were first written against.

**Agent gate (hard):**

- [x] `npm run build:web` — passes (tsc clean, Tailwind v4 + Vite 8 build OK)
- [x] `npm run lint` — passes
- [x] `npx -y impeccable detect apps/web/src/shared/components/ui apps/web/src/components/ui` → clean (exit 0, no findings)
- [~] CI green on the phase PR — n/a per single-branch directive (see header)

**Review checklist (user, at PR review):**

- [ ] Trailer/menu/dialog interactions keyboard-accessible (tab, Esc, focus visible)
- [ ] Confirm `.npmrc` legacy-peer-deps is acceptable long-term, or revisit once ESLint 9 migration is in scope

**On completion:** as Phase 0.

## Phase 3 — app-shell

Branch: `projection-room-redesign/phase-3-shell` (off `…/phase-2-primitives`)

Shell frames every page; rebuilt from scratch, not adapted (PLAN.md → "Phase 3").

- [x] Rebuild `shared/components/Navbar/` from scratch: `overlay`/`solid` modes, "Flix." wordmark, `Dropdown`-based Movie/TV menus (fixes duplicate IDs, audit #10), ≥3rem mobile menu button — `overlay` (fixed, gradient scrim) auto-selected via route match on `/^\/(movie|tv)\/\d+$/` (detail pages), `solid` (static, `border-b border-border bg-background`) everywhere else. Movie/TV menus use shadcn `DropdownMenu` (Radix owns `aria-expanded`/unique ids). Mobile nav uses shadcn `Sheet` (added via `npx shadcn add sheet`) instead of the old inline-expand panel — proper focus trap, `SheetClose` auto-dismisses on link click. `ProfileDropdown`'s old `useState` menu (Phase 0 stopgap) now folds into the same `DropdownMenu` pattern used app-wide.
- [x] Restyle `Search` (keep expand behavior; surface-raised results panel, visible focus) — field: `border-input bg-white/[0.08]` + `focus-visible:ring-ring/50`; results panel: `bg-popover border-border`; icon-button hit target bumped 40px→48px (audit #9); result rows themed (`hover:bg-accent`, movie/tv badge on `primary`/`secondary`), poster images now `loading="lazy"`.
- [x] Restyle `Footer`, `NotFound`, error states to tokens — `NotFound` fully rewritten: dropped the dead Bootstrap `row/col-sm-*` grid and the external dribbble.com GIF dependency (`NotFound.css` deleted) for a tokened kicker/display/CTA layout using the shadcn `Button`.

**Agent gate (hard):**

- [x] `npm run build:web` — passes
- [x] `npm run lint` — passes
- [x] `npx -y impeccable detect` on Navbar/Search/Footer/NotFound → clean (exit 0)
- [~] CI green on the phase PR — n/a per single-branch directive (see header)

**Review checklist (user, at PR review):**

- [ ] Keyboard-only navbar walk: tab through, Esc closes dropdowns/sheet, no duplicate-ID warnings in devtools
- [ ] Visual check in a real browser — not yet done this phase; build/lint/detector are static checks only

**On completion:** as Phase 0.

## Phase 4 — detail-pages

Branch: `projection-room-redesign/phase-4-detail` (off `…/phase-3-shell`)

The signature surfaces; match the concept render (PLAN.md → "Phase 4").

- [x] Movie detail (`features/Movie/components/Detail/`): full-bleed backdrop hero + scrims + drift animation (reduced-motion guarded), poster plate, Display title, amber rating, `Chip` genres, primary trailer `Button` → `Dialog`, ghost `IconButton`s; surface-color fallback when `backdropPath` null — restructured into hero (`Detail.tsx`: backdrop/scrim/`PosterPlate`/`Content`) + below-hero band (new `Overview.tsx`: overview text + `FactList` of director/release/runtime/language/status). `animate-hero-drift` keyframes added to `index.css` (`prefers-reduced-motion` guarded). Poster click still opens the full-size `Dialog` (kept from the incumbent, not in the concept mockup but a real existing feature).
- [x] Same layout for TV detail (`features/Tv/…`), incl. seasons section restyle — mirrored Movie's structure; new `Seasons.tsx` rail (poster + name + episode count, horizontal scroll) since TV never rendered seasons before this phase. TV's `Overview.tsx` facts use First Air Date/Seasons/Original Language, **not** Director/Runtime/Status — the `Tv`/`TvDetail` models don't carry those fields (TMDB TV credits don't reliably yield a "Director" crew job, and there's no `status`/`runtime` on the model); inventing them would mean fabricated data, so the two `Overview` components are intentionally not identical.
- [x] `shared/components/Cast/Cast.tsx` → horizontal rail; replace `window.location.pathname` routing with router APIs — went further than `useParams`: `mediaType`/`mediaId` are now explicit required props from the parent (Detail.tsx already knows them), so `Cast` no longer does any routing inference at all, not even a hook-based one.
- [x] `shared/components/Recommend.tsx` → 5-up/2-up gradient-caption grid — own card style (gradient caption overlay), intentionally distinct from `MediaListItem`'s bordered-badge card (that one is Phase 5's browse-grid concern).
- [x] Delete daisyUI breadcrumbs from detail pages — removed entirely (not just de-classed) from Movie/TV `Detail.tsx`; nav + backdrop context replaces them per the concept. `CastPage.tsx`/`Person.tsx` still have breadcrumbs — out of Phase 4's listed scope, left for Phase 7's sweep (those files are still light-mode/gray throughout and need a full pass, not a breadcrumb-only edit).

**Agent gate (hard):**

- [x] `npm run build:web` — passes
- [x] `npm run lint` — passes
- [x] `npx -y impeccable detect` on touched Movie/Tv/Cast/Recommend/Chip files → clean (exit 0)
- [x] Dev-server smoke check: `/movie/155` and `/tv/1399` both return HTTP 200, zero TypeScript errors from the checker plugin (amended check — no CI, no browser tool available this session, so this is the closest runtime signal beyond static checks)
- [~] CI green on the phase PR — n/a per single-branch directive (see header)

**Review checklist (user, at PR review):**

- [ ] Movie + TV detail match `concept-a-projection-room.html` at 1440px and 390px; trailer dialog keyboard-accessible; null-poster/backdrop titles render acceptably
- [ ] Real visual/interaction check in a browser — not done this phase (no browser tool invoked); build/lint/detector/dev-server-200 are static/shell checks only, not a substitute

**On completion:** as Phase 0.

## Phase 5 — browse-grids

Branch: `projection-room-redesign/phase-5-browse` (off `…/phase-4-detail`)

- [x] `shared/components/List/MediaListItem.tsx` → `PosterPlate` + gradient caption; menu trigger = `IconButton` + `Dropdown` (audit #9) — `PosterPlate` extended with an optional `children` overlay slot (backward compatible; Phase 4's hero usage untouched) to carry the gradient caption. Menu trigger bumped 20px→44px (WCAG minimum; not the full 48px used for hero-context icon buttons, since 48px would overwhelm a small grid-card corner control).
- [x] Fixed `features/Movie/pages/MoviesPage.tsx` (and `TVsPage.tsx`, same bug) scroll listener: doesn't drive loading (infinite scroll already uses `IntersectionObserver` via the existing `useInfiniteScroll` hook, confirmed by reading `MovieByDiscover.tsx`/`TvByDiscover.tsx`) — it only toggles a "scroll to top" button, so per the plan's own judgment-call note this is cleanup+rAF-throttle, not IntersectionObserver. Extracted a shared `useScrollThreshold` hook (both pages had the identical bug) with `removeEventListener` cleanup, `{ passive: true }`, and a `requestAnimationFrame` ticking guard. The scroll-to-top button itself was bare/unstyled with no `aria-label` — restyled to a translucent icon button and labeled.
- [x] Grid pages re-declared on new spacing tokens; all grid images lazy + aspect-ratio — `MediaListItem` poster now `loading="lazy"`; `PosterPlate` already renders `aspect-*` implicitly via the image's natural 2:3 ratio inside a fixed-ratio grid cell (browse grids use the fixed-width `autoFit` columns, not an explicit `aspect-*` class, so there's no CLS risk to fix beyond the lazy-load).
- [x] `shared/components/Filter/` — restyle `react-select` via its `styles`/`classNames` API to tokens; associate labels — `Genre.tsx` themed via `styles` (CSS var references, e.g. `var(--color-surface)`, so it stays in sync with the token source), `useId`-linked `inputId`/`htmlFor`; `Sort.tsx`'s native `<select>` got the same `useId` treatment plus token-based styling. **Note:** `Filter` is currently unused dead code — its one call site in `MoviesPage.tsx` is commented out, predating this session. Restyled anyway per this phase's explicit scope, but did **not** re-enable it (out of scope — that's a feature decision, not a design one).
- [x] **(amended)** `react-select@5.7.2`'s `StylesConfig` type doesn't structurally match the `csstype` version pulled in transitively by Phase 2's `@types/react` bump (a known ecosystem version-lag issue, not a defect in the style values) — worked around with a single boundary cast (`as StylesConfig<...>`) in `Genre.tsx` rather than loosening `tsconfig`'s strictness or downgrading `@types/react`.

**Agent gate (hard):**

- [x] `npm run build:web` — passes (after the react-select type cast fix above)
- [x] `npm run lint` — passes
- [x] `npx -y impeccable detect` on List/Filter/MoviesPage/TVsPage/useScrollThreshold/PosterPlate → clean (exit 0)
- [x] Dev-server smoke check: `/movie/discover/popular` and `/tv/discover/popular` both HTTP 200
- [~] CI green on the phase PR — n/a per single-branch directive (see header)

**Review checklist (user, at PR review):**

- [ ] Browse/discover pages match the world; scroll route-change leaves no stray listeners (devtools check)
- [ ] Real visual/interaction check in a browser — not done this phase (no browser tool invoked)

**On completion:** as Phase 0.

## Phase 6 — auth-user

Branch: `projection-room-redesign/phase-6-auth` (off `…/phase-5-browse`)

Kills the green/blue accent families and the remaining P1s (PLAN.md → "Phase 6").

- [x] `LoginForm`/`RegisterForm` → dark surface card (`bg-card`), `TextField`s, amber primary `Button` (audit #3) — kills the green CTA + `text-gray-100` AA-contrast failure by construction, since `Button`'s default variant is `bg-primary text-primary-foreground`. Also fixed `ThreeDots` (register's loading spinner): hardcoded `fill="#fff"` → `fill="currentColor"`, since DESIGN.md bans white text/fills on the amber button — it now correctly inherits `accent-ink`.
- [x] `LoginPage`/`RegisterPage`: delete lorem-ipsum + broken `<img src="">`; replace side panel per the world — both had identical copy (a pre-existing bug: RegisterPage said "Hi! Welcome Back" too) and an `<img src="">`. Replaced with real, honest, page-specific copy and a real TMDB backdrop image (`alt=""`, decorative) — no fabricated claims, no lorem ipsum.
- [x] User list pages, `List/` feature, `CreateNew` — sweep banned classes, restyle with primitives; theme `react-toastify` dark — `ListPage.tsx` had a real bug beyond styling: white cards (`bg-white`) with no explicit dark text color meant text inherited the light `text-foreground` on a white background, nearly invisible. Fixed to `bg-card`. `List/pages/Detail.tsx` and `PublicList.tsx` tabs/buttons moved off `cPrimary`/`gray-300` onto `primary`/`border` tokens and shadcn `Button`. `react-toastify`: `theme="dark"` plus its CSS custom properties (`--toastify-color-dark` etc.) retoned to `var(--color-surface-raised)` / `var(--color-primary)` instead of its generic dark defaults.
- [x] **(amended)** The phase 6 gate's `rg "green-|blue-"` check is repo-wide, and caught one `text-blue-600` in `Person.tsx` (a file otherwise out of this phase's scope, deferred to Phase 7's gray/slate sweep). Fixed only that one line (→ `text-primary`, plus a missing `type="button"` on the same element) rather than pulling all of `Person.tsx`'s styling into this phase.

**Agent gate (hard):**

- [x] `npm run build:web` — passes
- [x] `npm run lint` — passes
- [x] `npx -y impeccable detect apps/web/src` → zero findings (exit 0)
- [x] `rg "green-|blue-" apps/web/src` → empty
- [x] Dev-server smoke check: `/auth/login`, `/auth/register`, `/list/new` all HTTP 200
- [~] CI green on the phase PR — n/a per single-branch directive (see header)

**Review checklist (user, at PR review):**

- [ ] Login/register usable and on-world; toasts themed; list CRUD flows styled
- [ ] Real visual/interaction check in a browser — not done this phase (no browser tool invoked)

**On completion:** as Phase 0.

## Phase 7 — cleanup-gates

Branch: `projection-room-redesign/phase-7-cleanup` (off `…/phase-6-auth`)

- [x] Delete legacy tokens: `cPrimary`, `h-withoutNavbar` (replace last usage per PLAN.md → "Phase 7"), unused theme remnants — `h-withoutNavbar` had **11** usages, not the single one PLAN.md assumed (every per-page loading state); all replaced with `min-h-[60vh]`. `cPrimary`'s last two holdouts (`index.css` token def, `ProfileDropdown.tsx`'s logout-confirm "No" button) removed; the button now uses shadcn `Button` variants like every other confirm dialog in the app.
- [x] `rg "gray-|slate-|zinc-|btn |btn-|base-100|fortawesome|cPrimary" apps/web/src` → **amended**: the literal pattern in this checklist item false-positives on `translate-x`/`translate-y` (substring match on `slate-`/`zinc-`... actually `slate-x`/`slate-y` from `translate-`). Ran the precise version instead: `\b(bg|text|border|ring|from|to|via|divide|outline|fill|stroke|placeholder|decoration|caret|accent)-(gray|slate|zinc)-[0-9]+` plus separate exact-match checks for `cPrimary`/`btn`/`base-100`/`fortawesome`/`withoutNavbar` → all empty. Two full pages had never been touched by any earlier phase (`CastPage.tsx`, `Person.tsx` — heavy `gray-700` throughout, `bg-white` cards); rewrote both to tokens as part of this sweep.
- [x] Ran the `impeccable` skill's `audit` playbook (not a CLI subcommand — `npx impeccable audit` doesn't exist, only `detect` does; the skill's `reference/audit.md` is a manual scoring rubric) against the full redesign. **17/20** (target ≥16, met) with a11y **3/4** (target ≥3, met). Dated "after" section appended to `docs/design-audit.md` with a before/after table mapping every original finding to its resolution, plus an honest "Known Remaining Gaps" section (no live-browser verification was performed in any phase this session).
- [x] Synced `DESIGN.md`: added the shadcn semantic-slot mapping table (components read `primary`/`accent`/`muted`/etc., not the raw Projection Room token names directly — this wasn't documented when DESIGN.md was first written, before the shadcn pivot), corrected the icon-button hit-target rule to the two-tier system that actually shipped (48px spacious / 44px-minimum tight contexts, not a flat "3rem always"), added `TextField`/`Dialog`/`DropdownMenu` to the Components section, and noted the Tailwind v4 + shadcn/ui toolchain in the frontmatter description.

**Agent gate (hard):**

- [x] `npm run build:web` — passes
- [x] `npm run lint` — passes
- [x] `npx -y impeccable detect apps/web/src` → zero findings (exit 0)
- [x] Dev-server smoke check: 9 routes spanning every feature (`/movie/155`, `/tv/1399`, both discover pages, `/movie/155/cast`, `/person/6193`, both auth pages, `/list/new`) all HTTP 200
- [~] CI green on the phase PR — n/a per single-branch directive (see header)

**Review checklist (user, at PR review):**

- [ ] Full keyboard pass: navbar → search → grid → detail → trailer dialog → auth form; no invisible focus, no trap losses

**On completion:** as Phase 0.
