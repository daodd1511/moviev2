# Design Audit — Flix (`apps/web/src`)

Baseline technical audit of the current implementation. Read-only assessment; no source was modified. Generated 2026-07-24.

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 1 | Unassociated form labels, no focus rings, `aria-hidden` modal traps interactive content |
| 2 | Performance | 2 | Un-throttled, never-removed global scroll listener; zero image lazy-loading across poster grids |
| 3 | Responsive Design | 2 | Sub-44px touch targets on menu/scroll buttons; fixed-width login card |
| 4 | Theming | 1 | daisyUI semantic color classes used while `themes: false`; three competing accent families |
| 5 | Implementation Integrity | 2 | Lorem-ipsum placeholder + broken `<img src="">`, dead/commented filter feature, accent drift |
| **Total** | | **8/20** | **Poor (major overhaul)** |

## Implementation Integrity Verdict

**Fail (partial).** The implementation is a working product, but it does not yet express a coherent product-specific design system. Evidence: the deterministic detector found 4 anti-patterns (placeholder Lorem-ipsum copy behind a broken empty `<img>`, and washed-out gray-on-color CTAs); three unrelated accent color families (teal brand, spring-green auth, royal-blue nav) coexist with no governing rule; daisyUI's semantic color vocabulary (`bg-base-100`, `btn-primary`, `text-primary`) is used throughout while the config sets `themes: false`, meaning those color variables have no theme to resolve against; and a built Sort/Genre filter feature is commented out (`{/* <Filter type={MediaType.Movie}/> */}`) in `MoviesPage.tsx:30`. The bones (feature-folder architecture, DTO/mapper layers, memoized components) are sound; the visual layer is inherited-default and internally inconsistent.

## Executive Summary

- **Audit Health Score: 8/20 (Poor — major overhaul)**
- **Issues by severity:** P0: 0 · P1: 8 · P2: 9 · P3: 3
- **Top critical issues:**
  1. Form inputs have visually-present but programmatically unassociated labels (no `htmlFor`/`id`) across login, register, and sort — screen readers announce unlabeled fields.
  2. Modal sets `aria-hidden="true"` on the container that holds its own interactive content (close button, trailer iframe); it also lacks `role="dialog"`, focus trapping, and Esc-to-close.
  3. Primary auth CTA renders `text-gray-100` on `bg-green-400` — contrast ~1.5:1, failing WCAG AA badly (confirmed by detector).
  4. Global scroll listener in `MoviesPage.tsx` is registered without throttle and without cleanup, using an anonymous handler that can never be removed — leak plus per-scroll `setState`.
  5. Zero `loading="lazy"` on any of the 14 `<img>` tags; poster/cast grids load every image eagerly.
- **Recommended next steps:** `/impeccable harden` (a11y semantics, form labels, focus, modal), then `/impeccable optimize` (scroll listener, lazy images), then `/impeccable colorize` or a token pass to consolidate the three accent families, closing with `/impeccable polish`.

## Detailed Findings by Severity

### [P1] Form labels not associated with inputs
- **Location:** `apps/web/src/features/Auth/components/LoginForm/LoginForm.tsx:61-69, 73-81`; `apps/web/src/features/Auth/components/RegisterForm/RegisterForm.tsx` (all fields); `apps/web/src/shared/components/Filter/Sort.tsx:15-16`
- **Category:** Accessibility
- **Impact:** `<label>` elements carry no `htmlFor` and inputs have no matching `id`, so assistive tech announces the fields as unlabeled. Clicking the label does not focus the input.
- **WCAG:** 1.3.1 Info and Relationships (A), 4.1.2 Name/Role/Value (A)
- **Recommendation:** Add `id`/`htmlFor` pairs, or wrap the input inside the `<label>`.
- **Suggested command:** `/impeccable harden`

### [P1] Modal hides its own interactive content and lacks dialog semantics
- **Location:** `apps/web/src/shared/components/Modal.tsx:15-39`
- **Category:** Accessibility
- **Impact:** `aria-hidden="true"` on the outer container removes the modal (and its close button, trailer iframe, full-size image) from the accessibility tree. No `role="dialog"`/`aria-modal`, no focus trap, no Esc handler, no focus return. Close button has no accessible name.
- **WCAG:** 4.1.2 (A), 2.1.2 No Keyboard Trap (A), 2.4.3 Focus Order (A)
- **Recommendation:** Remove `aria-hidden`, add `role="dialog" aria-modal="true"` and an `aria-label`, trap focus, wire Esc, and give the close button an `aria-label`.
- **Suggested command:** `/impeccable harden`

### [P1] Failing contrast on primary auth CTA (gray text on green)
- **Location:** `apps/web/src/features/Auth/components/LoginForm/LoginForm.tsx:87`; `apps/web/src/features/Auth/components/RegisterForm/RegisterForm.tsx:104`
- **Category:** Accessibility / Theming
- **Impact:** `text-gray-100` (#f3f4f6) on `bg-green-400` (#4ade80) is roughly 1.5:1 — the main call-to-action label is barely legible. Detector rule `gray-on-color`.
- **WCAG:** 1.4.3 Contrast (Minimum) (AA)
- **Recommendation:** Use a darker green (`green-600`/`green-700`) as the background, or near-black text on the light green.
- **Suggested command:** `/impeccable clarify` (or a token/color pass)

### [P1] No visible focus indicators; outlines removed without replacement
- **Location:** `LoginForm.tsx:65,77` and `RegisterForm.tsx` (`focus:outline-none` with only a border-color shift); `apps/web/src/shared/components/Search/Search.tsx:44` (`outline-none`); most custom `<button>`s app-wide (only 7 `focus:` usages across the codebase)
- **Category:** Accessibility
- **Impact:** Keyboard users cannot see which control is focused. The border-color-only substitute is a weak signal and search has none.
- **WCAG:** 2.4.7 Focus Visible (AA)
- **Recommendation:** Add a `focus-visible:ring` treatment to interactive elements; never strip outlines without a replacement.
- **Suggested command:** `/impeccable harden`

### [P1] Un-throttled, non-removable global scroll listener
- **Location:** `apps/web/src/features/Movie/pages/MoviesPage.tsx:15-23`
- **Category:** Performance
- **Impact:** `window.addEventListener('scroll', ...)` runs an anonymous handler on every scroll frame, calling `setState` repeatedly; the effect has no cleanup, so the handler leaks and (on remount) can stack.
- **Recommendation:** Throttle/rAF the handler, name it, and return a cleanup that removes it. Mirror the same pattern for `TVsPage` if present.
- **Suggested command:** `/impeccable optimize`

### [P1] No image lazy-loading on poster/cast grids
- **Location:** `apps/web/src/shared/components/List/MediaListItem.tsx:38-42`; `apps/web/src/shared/components/Cast/Cast.tsx:69-73`; detail hero `apps/web/src/features/Movie/components/Detail/Detail.tsx:73-78`
- **Category:** Performance
- **Impact:** None of the 14 `<img>` tags use `loading="lazy"` or intrinsic `width`/`height`. Infinite-scroll grids fetch every off-screen poster immediately and shift layout as images arrive (CLS).
- **Recommendation:** Add `loading="lazy"` and `decoding="async"` plus width/height (or aspect-ratio) to grid images.
- **Suggested command:** `/impeccable optimize`

### [P1] daisyUI semantic color classes used with `themes: false`
- **Location:** `apps/web/tailwind.config.cjs:23` (`daisyui: { themes: false }`); consumers: `ProfileDropdown.tsx:35,52,53,56,57` (`bg-base-100`, `btn-primary`, `btn-error`, `text-neutral-content`), `List/Menu.tsx:86,101,118,136` (`hover:bg-base-300`, `bg-error`), `styles/Loader.tsx:11` (`text-primary`)
- **Category:** Theming
- **Impact:** With all daisyUI themes disabled, the CSS custom properties these classes reference (`--b1`, `--p`, `--er`, `--bc`) are undefined, so `bg-base-100`, `btn-primary`, `text-primary`, etc. can render with no/unintended color. 15+ usages depend on a theme that is switched off. (Verify against the running app.)
- **Recommendation:** Either enable a daisyUI theme (even a single custom one) or replace semantic classes with concrete Tailwind colors/tokens.
- **Suggested command:** `/impeccable document` follow-up → tokenize; interim `/impeccable colorize`

### [P1] Three competing accent color families, no governing rule
- **Location:** brand teal `#023246` (`tailwind.config.cjs`, `Navbar.tsx:52`, `Content.tsx:77`); auth green (`LoginForm.tsx`, `RegisterForm.tsx`, `LoginPage.tsx:18`); nav blue `bg-blue-700` (`Navbar.tsx:74`) + link blue (`Cast.tsx:49`)
- **Category:** Theming / Implementation Integrity
- **Impact:** The primary action color changes by surface (green in auth, teal on detail, blue in nav), so users get no consistent "commit" signal and the brand reads as three products.
- **Recommendation:** Pick one primary action color, demote the others to neutral/link roles, and encode as tokens.
- **Suggested command:** `/impeccable colorize`

### [P2] Sub-44px touch targets
- **Location:** `MediaListItem.tsx:55-61` (menu button `h-5 w-5` = 20px); `MoviesPage.tsx:33-39` (scroll-to-top `h-10 w-10` icon, no label); `Navbar.tsx:81-87` (hamburger `p-2`)
- **Category:** Responsive / Accessibility
- **Impact:** Targets below the 44×44px minimum are hard to hit on touch devices; the 20px poster menu button is the worst offender.
- **WCAG:** 2.5.5 Target Size (AAA) / 2.5.8 (AA, 24px min)
- **Recommendation:** Pad targets to ≥44px.
- **Suggested command:** `/impeccable adapt`

### [P2] Missing accessible names on icon-only buttons
- **Location:** `MediaListItem.tsx:55` (ellipsis menu), `MoviesPage.tsx:33` (scroll-to-top), `Navbar.tsx:81` (hamburger), `Search.tsx:65` (search toggle), `Modal.tsx:31` (close)
- **Category:** Accessibility
- **Impact:** Buttons whose only child is a FontAwesome icon expose no text to screen readers.
- **WCAG:** 4.1.2 (A)
- **Recommendation:** Add `aria-label` to each. (Only `Content.tsx:76` currently does this correctly.)
- **Suggested command:** `/impeccable harden`

### [P2] Duplicate DOM `id`s and missing `aria-expanded` in navbar
- **Location:** `apps/web/src/shared/components/Navbar/Navbar.tsx:97,117,155,175` — `id="mega-menu-dropdown-button"` and `id="mega-menu-dropdown"` each appear twice
- **Category:** Accessibility
- **Impact:** Duplicate IDs are invalid HTML and break `aria-labelledby` association; the disclosure buttons never set `aria-expanded`/`aria-controls`, so state is invisible to AT.
- **WCAG:** 4.1.1 Parsing / 4.1.2 (A)
- **Recommendation:** Unique IDs per dropdown; add `aria-expanded` bound to open state.
- **Suggested command:** `/impeccable harden`

### [P2] Low-contrast metadata text
- **Location:** `apps/web/src/features/Movie/components/Detail/components/Content.tsx:69` (`text-slate-400` rating/runtime/year); navbar dropdown `text-gray-300` on white (`Navbar.tsx:129,137,145,188,196,204`, mobile branch)
- **Category:** Accessibility
- **Impact:** `text-slate-400` (#94a3b8) on white is ~3:1, below AA for body text; `text-gray-300` on the white desktop dropdown is worse.
- **WCAG:** 1.4.3 (AA)
- **Recommendation:** Move to `slate-500`/`gray-500` or darker for informational text.
- **Suggested command:** `/impeccable clarify`

### [P2] Fixed-width login card can overflow small viewports
- **Location:** `apps/web/src/features/Auth/components/LoginForm/LoginForm.tsx:52` (`w-96` = 384px + `p-12`)
- **Category:** Responsive
- **Impact:** On viewports narrower than ~384px the card plus padding overflows, causing horizontal scroll.
- **Recommendation:** Use `w-full max-w-sm` with responsive padding.
- **Suggested command:** `/impeccable adapt`

### [P2] Non-interactive element styled as interactive
- **Location:** `apps/web/src/features/Movie/components/Detail/components/Content.tsx:122-125` (genre `<li>` has `cursor-pointer` + hover/active styles but no handler)
- **Category:** Implementation Integrity
- **Impact:** Affordance implies a filter action that does nothing — misleading interactivity.
- **Recommendation:** Wire genre filtering or drop the pointer/hover affordances.
- **Suggested command:** `/impeccable clarify`

### [P2] `window.location.pathname` used for routing state inside a component
- **Location:** `apps/web/src/shared/components/Cast/Cast.tsx:31-38`
- **Category:** Implementation Integrity
- **Impact:** Reading the raw pathname instead of router params couples the component to URL string shape and won't react to in-app navigation without a remount.
- **Recommendation:** Derive media type from route params/props.
- **Suggested command:** `/impeccable harden`

### [P2] Missing `alt` attributes on two images
- **Location:** `apps/web/src/features/Auth/pages/LoginPage.tsx:9` (`<img src="" />`), `apps/web/src/features/Auth/pages/RegisterPage.tsx:9`
- **Category:** Accessibility
- **Impact:** 12 of 14 images have alt text; these two decorative images have neither `alt` nor a valid `src`. See also the P2 integrity finding below.
- **WCAG:** 1.1.1 Non-text Content (A)
- **Recommendation:** Remove the empty images or supply a real asset and `alt=""` if decorative.
- **Suggested command:** `/impeccable harden`

### [P2] Placeholder content shipped (Lorem ipsum + broken image)
- **Location:** `apps/web/src/features/Auth/pages/LoginPage.tsx:9-15` and `RegisterPage.tsx:9-15`
- **Category:** Implementation Integrity
- **Impact:** An empty `<img src="">` renders as a broken-image box (detector rule `broken-image`) above literal Lorem-ipsum marketing copy. Ships placeholder scaffolding as production UI.
- **Recommendation:** Replace with real copy/imagery or remove the panel (it is `hidden` below `xl`, so easy to overlook).
- **Suggested command:** `/impeccable clarify`

### [P3] Dead/commented filter feature
- **Location:** `apps/web/src/features/Movie/pages/MoviesPage.tsx:30` (`{/* <Filter type={MediaType.Movie}/> */}`)
- **Category:** Implementation Integrity
- **Impact:** A fully built Sort + Genre filter (`shared/components/Filter/`) is commented out, leaving dead UI code and unreachable functionality.
- **Recommendation:** Ship or remove the filter.
- **Suggested command:** `/impeccable shape`

### [P3] Orphaned dark-mode variant
- **Location:** `apps/web/src/shared/components/Navbar/Navbar.tsx:52` (`dark:bg-gray-900`)
- **Category:** Theming
- **Impact:** A single `dark:` variant exists with no dark-mode strategy, toggle, or `darkMode` config — dead style.
- **Recommendation:** Either commit to dark mode system-wide or remove the stray variant.
- **Suggested command:** `/impeccable colorize`

### [P3] Thin page content / placeholder pages
- **Location:** `apps/web/src/features/User/pages/ProfilePage.tsx:10-15` ("Profile page / Hello {username}")
- **Category:** Implementation Integrity
- **Impact:** Authenticated profile page is a stub with no layout or design treatment.
- **Recommendation:** Design the profile surface.
- **Suggested command:** `/impeccable shape`

## Detector Output (`npx impeccable detect apps/web/src`)

4 anti-patterns found:

| Rule | Count | Locations |
|------|-------|-----------|
| `gray-on-color` | 2 | `LoginForm.tsx:87`, `RegisterForm.tsx:104` (`text-gray-100` on `bg-green-400`) |
| `broken-image` | 2 | `LoginPage.tsx:9`, `RegisterPage.tsx:9` (`<img src="">`) |
| **Total** | **4** | |

## Patterns & Systemic Issues

- **Form accessibility is systemically missing:** no label associations, no focus rings, no error `aria-*` wiring — repeats across every form (login, register, sort).
- **Icon buttons lack accessible names** in 5+ locations; only one button (`Content.tsx:76`) does it right.
- **Theming has no token layer beyond `cPrimary`:** ~150 hardcoded Tailwind color utilities (41× `text-gray`, 22× `text-white`, 17× `border-gray`, 10× `text-blue`, etc.), and daisyUI semantic classes lean on a theme that is disabled.
- **Accent drift:** three unrelated accent families with no rule governing which means "primary action."
- **Media performance not addressed:** no lazy-loading, no image dimensions, un-throttled scroll listeners.

## Positive Findings

- **Solid app architecture:** feature-folder structure, DTO → mapper → model layering, typed React Query hooks per domain.
- **Components are memoized** (`memo`) and `Content.tsx` uses `useMemo`/`useCallback` appropriately.
- **Screen-reader-only loading text** is implemented correctly in `Loader.tsx` (visually-hidden `role="status"` span), and `prefers-reduced-motion` is respected there.
- **One coherent brand gesture** (the teal navbar) and a consistent, single type family give a foundation to build a real system on.
- **Most images (12/14) carry alt text** and posters have a graceful `/images/no-image.png` fallback.

## Recommended Actions

1. **[P1] `/impeccable harden`** — form label associations, focus-visible rings, modal dialog semantics + focus trap, accessible names on icon buttons, duplicate-ID fixes.
2. **[P1] `/impeccable optimize`** — throttle + clean up scroll listeners; add `loading="lazy"` and image dimensions across poster/cast grids.
3. **[P1] `/impeccable colorize`** — consolidate the three accent families into one token-backed action color; resolve the daisyUI `themes: false` conflict.
4. **[P2] `/impeccable adapt`** — pad touch targets to ≥44px; make the login card fluid.
5. **[P2] `/impeccable clarify`** — fix low-contrast CTA/metadata text; remove Lorem-ipsum + broken images; resolve misleading genre-chip affordance.
6. **[P3] `/impeccable shape`** — decide the fate of the commented-out Filter and stub Profile page.
7. **[P1] `/impeccable polish`** — final consistency pass after the above.

> You can ask me to run these one at a time, all at once, or in any order you prefer.
>
> Re-run `/impeccable audit` after fixes to see your score improve.
</content>
