# Flix Redesign — Implementation Plan ("Projection Room")

Execution guide for the chosen redesign direction. Written 2026-07-24 for an
AI agent (or human) to implement phase by phase.

## Authority documents — read these first

1. **`DESIGN.md`** (repo root) — the committed design system. Every visual
   decision must trace to it. If a needed value is missing, add it to
   DESIGN.md in the same change; never invent one-off values inline.
2. **`docs/design-concepts/concept-a-projection-room.html`** — the approved
   reference render. Open it in a browser next to the app while working.
   It is the source of truth for composition; DESIGN.md is the source of
   truth for tokens and rules.
3. **`docs/design-audit.md`** — defects in the current UI. Every P1 listed
   there is assigned to a phase below; none may survive the migration.

## Ground rules

- Work phase by phase, in order. Finish a phase's Definition of Done before
  starting the next. Do not commit unless the user asks; when asked, one
  commit per phase.
- Keep the existing architecture: feature folders, DTO → mapper → model
  flow, TanStack Query stores, route structure. This is a reskin plus
  component extraction, not a rewrite. Do not touch `apps/api`.
- Strict TypeScript. No `any`, no loosening of existing types.
- The design detector runs on edit (Impeccable hook) and reads DESIGN.md.
  Treat its findings as review comments: fix real drift; if a value is
  intentional, add it to DESIGN.md rather than suppressing.
- Banned in all new/edited code: `gray-*`, `slate-*`, `zinc-*` color
  utilities; any daisyUI class (`btn`, `bg-base-*`, `text-primary`,
  `breadcrumbs`, `rounded-box`, …); any `@fortawesome` import; the Google
  Fonts CSS `@import`; `focus:outline-none` without a `:focus-visible`
  replacement; radii other than the two-token system.
- Every interactive element: visible amber `:focus-visible` ring, ≥44px
  (2.75rem) hit target — icon buttons 3rem.
- Every `<img>`: real `alt`, `loading="lazy"` (except the hero backdrop
  and detail poster), `width`/`height` or `aspect-ratio` to prevent CLS.

## Stack decision

**Superseded 2026-07-24 (user directive, Phase 2):** upgraded to Tailwind
**4.3.3** (`@tailwindcss/vite`, CSS-first `@theme`, no `tailwind.config.cjs`)
and Vite **8.1.5** (`@vitejs/plugin-react` 6.0.4, `vite-plugin-checker`
0.14.5), to install and extend shadcn/ui's generated primitives on their
native footing rather than forcing shadcn's current CLI to target an old
Tailwind 3 setup. `@types/node`/`@types/react`/`@types/react-dom` bumped to
match. ESLint 8 and TypeScript 4.8 were **not** bumped — that cascades into
a separate flat-config + `@typescript-eslint` v8 migration, out of scope
here; `apps/web/.npmrc` (`legacy-peer-deps=true`) papers over the resulting
peer-dependency friction from `vite-plugin-checker`'s unused optional ESLint
9 peer. Full detail in `EXECUTION.md` → Phase 2.

<details><summary>Original decision (superseded, kept for history)</summary>

Stay on Tailwind 3 for this migration. Tokens live as CSS custom properties
in `:root` and Tailwind reads them via `theme.extend` — identical authoring
model to Tailwind 4, so a later v4 upgrade is mechanical. Upgrading
Vite 3 / TS 4.8 / Tailwind 3 first would be a separate risky track; do not
mix it into the redesign. (Tradeoff: we forgo v4's native `@theme` and
faster build now, in exchange for zero toolchain churn mid-redesign.)

</details>

---

## Phase 0 — Dependencies and font

**Remove:** `daisyui` (and its plugin entry plus `daisyui:{themes:false}`
block in `tailwind.config.cjs`), all four `@fortawesome/*` packages.

**Add:** `lucide-react` (icons), `@fontsource/be-vietnam-pro` (weights
200/300/400/500/600 only).

**Change:**

- Delete the Google Fonts `@import` from `src/index.css`; import the five
  `@fontsource` weight files in `src/main.tsx`.
- Grep for every daisyUI class and Font Awesome icon usage; replace icons
  with lucide equivalents (`List`→`ListIcon`, `faVideo`→`Play`,
  `faBars`→`Menu`, `faEllipsis`→`MoreHorizontal`, `faMagnifyingGlass`→`Search`,
  etc.). Replace daisyUI-styled elements with plain elements styled by
  existing utilities — they will be restyled properly in later phases;
  this phase only removes the dependency without visual regression panic.

**DoD:** `npm run build` passes; `rg -l "daisyui|fortawesome|fonts.googleapis"
apps/web` returns nothing; app renders with no missing icons.

## Phase 1 — Tokens

In `src/index.css`:

```css
:root {
  --color-ground: #041219;
  --color-surface: #07202e;
  --color-surface-raised: #0b2a3a;
  --color-line: #133a4d;
  --color-text: #d9e7ee;
  --color-text-muted: #8fb3c4;
  --color-accent: #f5a524;
  --color-accent-ink: #1c1302;
  --color-danger: #f0605d;
}
@layer base {
  html {
    font-family: 'Be Vietnam Pro', ui-sans-serif, system-ui, sans-serif;
  }
  body {
    background: var(--color-ground);
    color: var(--color-text);
    font-weight: 300;
  }
  :focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 3px;
  }
}
```

In `tailwind.config.cjs`, replace the `colors` extension:

```js
colors: {
  ground: 'var(--color-ground)',
  surface: 'var(--color-surface)',
  'surface-raised': 'var(--color-surface-raised)',
  line: 'var(--color-line)',
  body: 'var(--color-text)',
  muted: 'var(--color-text-muted)',
  accent: 'var(--color-accent)',
  'accent-ink': 'var(--color-accent-ink)',
  danger: 'var(--color-danger)',
},
borderRadius: { DEFAULT: '0.75rem', md: '0.75rem', full: '9999px' },
```

Keep `cPrimary` and the `autoFit` grid templates temporarily (legacy pages
still reference them); Phase 7 deletes them. The page going dark will make
unmigrated pages look wrong — acceptable mid-migration; phases 3–6 sweep
every page.

**DoD:** build passes; body renders dark ground / light text; DESIGN.md
values and `:root` values match exactly.

## Phase 2 — UI primitives (`src/shared/components/ui/`)

Build these components, styled per DESIGN.md's Components section and the
concept file's CSS (translate it to Tailwind utilities against the new
tokens). Props stay minimal; variants via a `variant` prop, no styling
props leaking class strings from callers.

| Component     | Notes                                                                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button`      | `variant: 'primary' \| 'ghost'`; primary = amber pill + tinted shadow + hover lift                                                                                                                      |
| `IconButton`  | 3rem translucent circle; `label` prop is required and renders `aria-label`                                                                                                                              |
| `Chip`        | genre pill; renders `<Link>`; hover = amber border + faint amber fill                                                                                                                                   |
| `Kicker`      | section heading (`h2`) — tracked uppercase muted                                                                                                                                                        |
| `PosterPlate` | image plate: radius, translucent outline, media-lift shadow                                                                                                                                             |
| `FactList`    | key/value rows with line-color rules                                                                                                                                                                    |
| `Rail`        | section wrapper: Kicker + optional "View all →" link + children                                                                                                                                         |
| `TextField`   | label + input pair, translucent field, amber focus ring; `id` generated with `useId`, label always associated (fixes audit P1 #1)                                                                       |
| `Dialog`      | replaces `Modal.tsx`: `role="dialog"` + `aria-modal`, focus trap, Esc close, backdrop click, removes the wrong `aria-hidden` (fixes audit P1 #2). Use native `<dialog>` element — simplest correct trap |
| `Dropdown`    | one headless implementation (outside-click + Esc + `aria-expanded`) replacing the three hand-rolled useState menus (Navbar, ProfileDropdown, item Menu)                                                 |

Delete each old counterpart as its replacement lands (`Modal.tsx`,
`styles/Loader.tsx` restyled to an amber-on-ground spinner).

**DoD:** all primitives exist with the a11y behavior above; `Modal.tsx`
deleted; detector clean on the new files.

## Phase 3 — App shell

- **Navbar** (`shared/components/Navbar/`): rebuild from scratch per the
  concept — do not adapt the Flowbite markup. Two render modes:
  `overlay` (absolute, gradient scrim — detail pages) and `solid`
  (ground background — everything else). Wordmark "Flix." with amber
  period. Active route = full text color; inactive = muted. Movie/TV
  dropdowns use the Phase-2 `Dropdown` (fixes duplicate IDs +
  `aria-expanded`, audit finding #10). Mobile: `Menu` icon button ≥3rem.
- **Search**: keep the expanding-width behavior; restyle field and results
  panel to surface-raised + line tokens; add a visible focus ring.
- **Footer**: muted text on ground, line-color top border.
- **NotFound / error states**: ground + kicker + headline styling.

**DoD:** every route shows the new shell; keyboard-only walk of the navbar
(tab, arrows optional, Esc closes dropdowns) works; no duplicate DOM ids.

## Phase 4 — Detail pages (Movie + TV)

The signature phase; match the concept file closely.

- `features/Movie/components/Detail/` and the TV equivalent share layout:
  full-bleed hero (backdrop under two-part scrim, bottom-aligned content,
  poster plate 240px left, title block right), then overview/fact-list
  two-column band, then Cast rail, then Recommendations rail.
- Backdrop: `movie.backdropPath` at `original` size; the drift animation
  (scale 1.08→1, 40s, ease-out, `prefers-reduced-motion` guarded). Fall
  back to a surface-color hero when `backdropPath` is null.
- Title = Display type; tagline italic muted; metadata line = rating
  (amber ★), runtime, year, director, separated by line-color dots.
- Genres = `Chip` row. Actions = primary `Button` (“Watch Trailer”, opens
  the Phase-2 `Dialog` with the YouTube embed) + ghost `IconButton`s
  (add-to-list via existing `Menu` logic moved into `Dropdown`, favorite).
- `Cast.tsx` → horizontal-scroll rail of cast cards (fix the
  `window.location.pathname` routing to `useParams`/`Link` while there).
- `Recommend.tsx` → 5-up rec grid (2-up mobile) with gradient-caption
  cards.
- Breadcrumbs: delete (daisyUI class; the nav + backdrop context replaces
  them, as in the concept).

**DoD:** Movie and TV detail pages visually match the concept at 1440px
and 390px; poster-less and backdrop-less titles render acceptably; trailer
dialog is keyboard-accessible.

## Phase 5 — Browse, grids, list menus

- `MediaListItem` → PosterPlate + gradient caption (title, year, ★ rating)
  per the concept's rec cards; item menu trigger = `IconButton` (fixes
  20px touch target, audit #9) opening the `Dropdown`.
- Grid pages (`MoviesPage`, TV, discover routes): keep `autoFit` grid
  behavior but re-declare it against the new spacing tokens.
- Fix `MoviesPage.tsx:15-23`: replace the raw scroll listener with a
  cleanup-returning, rAF-throttled effect — or an `IntersectionObserver`
  sentinel if it drives infinite loading (audit P1 #5).
- Filter/Sort controls (`shared/components/Filter`): restyle
  `react-select` via its `styles`/`classNames` API to surface-raised +
  line + amber tokens; associate labels (audit #1).

**DoD:** browse pages match the world; scroll listener leak gone
(profiler shows stable listener count across route changes); grid images
all lazy with aspect ratios.

## Phase 6 — Auth and user pages

- Login/Register: dark form card (surface, radius, media-lift shadow),
  `TextField` everywhere (labels associated), primary amber CTA — kills
  the green-on-gray AA failure (audit #3) and the green/blue accent
  families entirely.
- Delete the lorem-ipsum copy and the broken `<img src="">` on
  `LoginPage`/`RegisterPage` (audit + detector `broken-image`); replace
  with a poster-collage or backdrop panel per the world.
- User list pages / list detail / CreateNew: sweep for banned classes,
  restyle with primitives; `react-toastify` themed dark (surface-raised,
  text, amber progress).

**DoD:** `npx impeccable detect apps/web/src` reports zero findings; no
green/blue accents remain (`rg "green-|blue-" apps/web/src` clean except
third-party).

## Phase 7 — Cleanup and gates

1. Delete legacy tokens: `cPrimary`, `h-withoutNavbar` (replace the one
   loader usage with `min-h-dvh` minus the nav via flex layout), unused
   `colors`/`fontFamily` remnants.
2. Repo-wide bans check:
   `rg "gray-|slate-|zinc-|btn |btn-|base-100|fortawesome|cPrimary" apps/web/src` → empty.
3. Run the full evaluation: `/impeccable audit apps/web` — target ≥16/20,
   with a11y ≥3/4 (baseline was 8/20, a11y 1/4).
4. Keyboard pass: tab through navbar → search → grid → detail → trailer
   dialog → auth form. No focus trap losses, no invisible focus.
5. Update `docs/design-audit.md` with a dated "after" section, and update
   DESIGN.md if any token changed during implementation (it must always
   match shipped values).

---

## Audit P1 → phase map

| Audit finding                              | Fixed in                            |
| ------------------------------------------ | ----------------------------------- |
| 1. Unassociated form labels                | 2 (TextField), 5 (Filter), 6 (Auth) |
| 2. Modal aria-hidden / no dialog semantics | 2 (Dialog)                          |
| 3. CTA contrast (green-400/gray-100)       | 6                                   |
| 4. No visible focus indicators             | 1 (global ring) + per-component     |
| 5. Scroll listener leak                    | 5                                   |
| 6. No image lazy-loading                   | 4, 5 (rule in Ground rules)         |
| 7. daisyUI classes with themes:false       | 0 (removal)                         |
| 8. Three competing accents                 | 1–6 (single amber accent)           |
| 9. Sub-44px touch targets                  | 2 (IconButton), 3, 5                |
| 10. Duplicate IDs / aria-expanded          | 3 (Navbar + Dropdown)               |
