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

- Current phase: 2 — done (local gate green; CI n/a per single-branch directive)
- Phase 0 — deps-and-font: done
- Phase 1 — tokens: done (superseded by Phase 2's Tailwind v4 retheme — index.css/tailwind.config.cjs from Phase 1 no longer exist as such; see Phase 2 for current token source of truth)
- Phase 2 — ui-primitives: done
- Phase 3 — app-shell: pending
- Phase 4 — detail-pages: pending
- Phase 5 — browse-grids: pending
- Phase 6 — auth-user: pending
- Phase 7 — cleanup-gates: pending
- Verification debt: none

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

- [ ] Rebuild `shared/components/Navbar/` from scratch: `overlay`/`solid` modes, "Flix." wordmark, `Dropdown`-based Movie/TV menus (fixes duplicate IDs, audit #10), ≥3rem mobile menu button
- [ ] Restyle `Search` (keep expand behavior; surface-raised results panel, visible focus)
- [ ] Restyle `Footer`, `NotFound`, error states to tokens

**Agent gate (hard):**
- [ ] `npm run build:web`
- [ ] `npm run lint`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**
- [ ] Keyboard-only navbar walk: tab through, Esc closes dropdowns, no duplicate-ID warnings in devtools

**On completion:** as Phase 0.

## Phase 4 — detail-pages

Branch: `projection-room-redesign/phase-4-detail` (off `…/phase-3-shell`)

The signature surfaces; match the concept render (PLAN.md → "Phase 4").

- [ ] Movie detail (`features/Movie/components/Detail/`): full-bleed backdrop hero + scrims + drift animation (reduced-motion guarded), poster plate, Display title, amber rating, `Chip` genres, primary trailer `Button` → `Dialog`, ghost `IconButton`s; surface-color fallback when `backdropPath` null
- [ ] Same layout for TV detail (`features/Tv/…`), incl. seasons section restyle
- [ ] `shared/components/Cast/Cast.tsx` → horizontal rail; replace `window.location.pathname` routing with router APIs
- [ ] `shared/components/Recommend.tsx` → 5-up/2-up gradient-caption grid
- [ ] Delete daisyUI breadcrumbs from detail pages

**Agent gate (hard):**
- [ ] `npm run build:web`
- [ ] `npm run lint`
- [ ] `npx -y impeccable detect apps/web/src/features` → no new findings in touched files
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**
- [ ] Movie + TV detail match `concept-a-projection-room.html` at 1440px and 390px; trailer dialog keyboard-accessible; null-poster/backdrop titles render acceptably

**On completion:** as Phase 0.

## Phase 5 — browse-grids

Branch: `projection-room-redesign/phase-5-browse` (off `…/phase-4-detail`)

- [ ] `shared/components/List/MediaListItem.tsx` → `PosterPlate` + gradient caption; menu trigger = `IconButton` + `Dropdown` (audit #9)
- [ ] Fix `features/Movie/pages/MoviesPage.tsx:15-23` scroll listener: cleanup + rAF throttle, or IntersectionObserver if it drives loading (judgment call at execution; audit P1 #5)
- [ ] Grid pages re-declared on new spacing tokens; all grid images lazy + aspect-ratio
- [ ] `shared/components/Filter/` — restyle `react-select` via its `styles`/`classNames` API to tokens; associate labels

**Agent gate (hard):**
- [ ] `npm run build:web`
- [ ] `npm run lint`
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**
- [ ] Browse/discover pages match the world; scroll route-change leaves no stray listeners (devtools check)

**On completion:** as Phase 0.

## Phase 6 — auth-user

Branch: `projection-room-redesign/phase-6-auth` (off `…/phase-5-browse`)

Kills the green/blue accent families and the remaining P1s (PLAN.md → "Phase 6").

- [ ] `LoginForm`/`RegisterForm` → dark surface card, `TextField`s, amber primary CTA (audit #3)
- [ ] `LoginPage`/`RegisterPage`: delete lorem-ipsum + broken `<img src="">`; replace side panel per the world
- [ ] User list pages, `List/` feature, `CreateNew` — sweep banned classes, restyle with primitives; theme `react-toastify` dark

**Agent gate (hard):**
- [ ] `npm run build:web`
- [ ] `npm run lint`
- [ ] `npx -y impeccable detect apps/web/src` → zero findings
- [ ] `rg "green-|blue-" apps/web/src` → empty (excluding third-party)
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**
- [ ] Login/register usable and on-world; toasts themed; list CRUD flows styled

**On completion:** as Phase 0.

## Phase 7 — cleanup-gates

Branch: `projection-room-redesign/phase-7-cleanup` (off `…/phase-6-auth`)

- [ ] Delete legacy tokens: `cPrimary`, `h-withoutNavbar` (replace last usage per PLAN.md → "Phase 7"), unused theme remnants
- [ ] `rg "gray-|slate-|zinc-|btn |btn-|base-100|fortawesome|cPrimary" apps/web/src` → empty
- [ ] Run `/impeccable audit apps/web`; append dated "after" section to `docs/design-audit.md` (target ≥16/20, a11y ≥3/4)
- [ ] Sync `DESIGN.md` with any token that changed during implementation

**Agent gate (hard):**
- [ ] `npm run build:web`
- [ ] `npm run lint`
- [ ] `npx -y impeccable detect apps/web/src` → zero findings
- [ ] CI green on the phase PR

**Review checklist (user, at PR review):**
- [ ] Full keyboard pass: navbar → search → grid → detail → trailer dialog → auth form; no invisible focus, no trap losses

**On completion:** as Phase 0.
