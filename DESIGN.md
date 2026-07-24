---
name: Flix
description: A dark, image-forward movie and TV browsing app. Visual world — "Projection Room" — committed 2026-07-24; reference render at docs/design-concepts/concept-a-projection-room.html. Built on Tailwind v4 (CSS-first `@theme`, see src/index.css) and shadcn/ui (Radix primitives); component layer lives in apps/web/src/components/ui (shadcn-generated) and apps/web/src/shared/components/ui (custom compositions).
colors:
  ground: '#041219'
  surface: '#07202e'
  surface-raised: '#0b2a3a'
  line: '#133a4d'
  text: '#d9e7ee'
  text-muted: '#8fb3c4'
  accent: '#f5a524'
  accent-ink: '#1c1302'
  brand-teal: '#023246'
  danger: '#f0605d'
typography:
  display:
    fontFamily: 'Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(2.6rem, 6vw, 5rem)'
    fontWeight: 200
    lineHeight: 1.02
    letterSpacing: '0.015em'
    textTransform: uppercase
  headline:
    fontFamily: 'Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 300
    lineHeight: 1.25
  kicker:
    fontFamily: 'Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.82rem'
    fontWeight: 500
    letterSpacing: '0.2em'
    textTransform: uppercase
  body:
    fontFamily: 'Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 300
    lineHeight: 1.65
  body-large:
    fontFamily: 'Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.08rem'
    fontWeight: 300
    lineHeight: 1.8
  label:
    fontFamily: 'Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
    letterSpacing: '0.025em'
rounded:
  md: '0.75rem'
  full: '9999px'
spacing:
  gutter: '3rem'
  gutter-mobile: '1.25rem'
  section: '4.5rem'
  rail-gap: '1.25rem'
  content-max: '82rem'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-ink}'
    rounded: '{rounded.full}'
    padding: '0.85rem 1.9rem'
    fontWeight: 600
  button-ghost:
    backgroundColor: 'rgba(217,231,238,0.08)'
    borderColor: 'rgba(217,231,238,0.2)'
    textColor: '{colors.text}'
    rounded: '{rounded.full}'
  chip-genre:
    backgroundColor: 'transparent'
    borderColor: 'rgba(217,231,238,0.22)'
    textColor: '{colors.text-muted}'
    rounded: '{rounded.full}'
    padding: '0.45rem 1.1rem'
  input-text:
    backgroundColor: 'rgba(217,231,238,0.08)'
    borderColor: 'rgba(217,231,238,0.15)'
    textColor: '{colors.text}'
    rounded: '{rounded.md}'
    padding: '0.6rem 1rem'
  card-poster:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.md}'
    outline: '1px solid rgba(217,231,238,0.14)'
---

# Design System: Flix — "Projection Room"

## Overview

**Creative North Star: "The backdrop is the page."**

Flix is a dark, image-forward cinema catalog. Every screen sits inside a
projection-booth darkness — a teal-black ground deepened from the original
brand color (#023246 → #041219) — so that TMDB imagery (backdrops, posters,
portraits) carries all the visual weight. Chrome recedes: navigation floats
over imagery on gradient scrims, sections are labeled with small tracked
kickers, and depth comes from layered translucency on the single ground
color, never from borders on white.

One accent exists: warm amber (#f5a524). It is reserved for exactly three
jobs — the primary action, the rating, and active/brand punctuation. It
replaces all three of the old competing accents (green, blue, and expanded
teal). Secondary text is always tinted from the teal family (#8fb3c4),
never neutral gray, so even quiet text belongs to the world.

Typography keeps the incumbent's one surviving signature: hairline
uppercase display titles (Be Vietnam Pro, weight 200) at large scale,
against weight-500 labels. Hierarchy is weight and size, not color.

**Key Characteristics:**

- Full-bleed backdrop heroes under layered scrims; content composed over imagery
- Single dark ground with translucent overlays (rgba of the text color) for surfaces
- One amber accent with a strict three-job reservation
- Teal-tinted secondary text; no neutral grays anywhere on the dark ground
- Hairline uppercase display type; tracked uppercase kickers as section labels

## Colors

### Primary

- **Ground** (#041219): The page background everywhere. Derived from brand teal darkened to near-black; never pure black, never gray.
- **Surface** (#07202e) / **Surface Raised** (#0b2a3a): Panels, dropdowns, modals. Steps up the same teal ramp.
- **Line** (#133a4d): Hairline dividers and list rules on the ground.

### Accent

- **Amber** (#f5a524) with **Accent Ink** (#1c1302) as its on-color: the primary CTA fill, the rating star and value, active nav state, kicker text when emphasized, focus rings. Nothing else. Text on amber is always accent-ink, never white.

### Text

- **Text** (#d9e7ee): Primary copy. ~13.5:1 on ground.
- **Text Muted** (#8fb3c4): Secondary copy, metadata, inactive nav. ~7:1 on ground. This is the ONLY muted text color; gray-_/slate-_ classes are banned on the dark ground.

### Translucent overlays

Interactive chrome (ghost buttons, inputs, chips, hover fills) uses rgba
of the text color on the ground: `rgba(217,231,238,.08)` fill,
`rgba(217,231,238,.15–.22)` borders, stepping to `.16` fill on hover.

### Retained

- **Brand Teal** (#023246): the wordmark origin and the ramp's anchor; not used as a fill in the new world.
- **Danger** (#f0605d): destructive confirms only, lightened for AA on the dark ground.

### shadcn semantic slots

Every shadcn/Radix component (`Button`, `Dialog`, `DropdownMenu`, `Sheet`, `Input`, `Label`)
reads Tailwind's standard semantic slot names, mapped onto the tokens above — this mapping,
not the raw hex values, is what components actually consume:

| Slot                                | Maps to               | Slot                             | Maps to               |
| ----------------------------------- | --------------------- | -------------------------------- | --------------------- |
| `background` / `foreground`         | Ground / Text         | `primary` / `primary-foreground` | Amber / Accent Ink    |
| `card`, `popover` (+ `-foreground`) | Surface Raised / Text | `secondary` (+ `-foreground`)    | Surface / Text        |
| `muted` (+ `-foreground`)           | Surface / Text Muted  | `accent` (+ `-foreground`)       | Surface Raised / Text |
| `destructive` (+ `-foreground`)     | Danger / Ground       | `border`, `input`                | Line                  |
| `ring`                              | Amber                 |                                  |                       |

Note `accent` here is shadcn's own vocabulary for "subtle hover surface" (menu-item hover,
etc.) — it is **not** the brand amber and must not be confused with it. This is why the Colors
section above calls the brand color "Amber," never "accent," in prose.

### Named Rules

**The Three-Job Amber Rule.** Amber (the `primary` slot) appears only as: primary action, rating, active/brand punctuation. A fourth job requires removing one of the three.
**The No-Gray Rule.** On the dark ground every "gray" is teal-tinted (text-muted-foreground or a text-color rgba). Tailwind gray/slate/zinc utilities must not appear in new code.

## Typography

**Single family:** Be Vietnam Pro, weights 200 / 300 / 400 / 500 / 600 only, self-hosted (no Google Fonts CSS import at runtime).

### Hierarchy

- **Display** (200, clamp(2.6rem→5rem), uppercase, line-height 1.02): detail-page titles over the hero scrim.
- **Headline** (300, 1.5rem): page-level headings outside detail heroes.
- **Kicker** (500, 0.82rem, tracking .2em, uppercase, text-muted): every section label ("Overview", "Top Billed Cast", "More Like This"). Kickers replace old bold section headings.
- **Body** (300, 1rem, lh 1.65) and **Body Large** (300, 1.08rem, lh 1.8) for overview paragraphs, max 65ch.
- **Label** (500, 0.875rem): buttons, form labels, cast names.

### Named Rules

**The Hairline Title Rule (kept).** Large titles are weight 200 uppercase; hierarchy is built by weight and size contrast, not color.

## Layout

Content max-width 82rem, centered, with 3rem gutters (1.25rem below 860px).
Detail pages open with a full-bleed hero (~92vh desktop): backdrop image
under a two-part scrim (bottom-up ground gradient + left-side darkening),
content bottom-aligned — poster plate (240px) left, title block right.
Below the hero, a two-column band (overview 1.8fr / fact-list 1fr), then
full-width rails. Rails are horizontal scroll for cast (fixed 9.5rem
columns) and a 5-up grid for recommendations (2-up mobile). Section rhythm
4.5rem; breakpoint for the mobile collapse: 860px.

## Elevation & Depth

Depth = darkness layering, not borders. Posters and floating panels take
large soft offset shadows (`0 24px 48px -12px rgba(0,0,0,.7)`); the amber
CTA carries a tinted shadow (`0 10px 26px -8px rgba(245,165,36,.55)`).
Images sit in plates with a 1px translucent outline
(`rgba(217,231,238,.14)`) to hold their edge against the dark ground.
Gradient scrims (ground-colored, two directions) guarantee text contrast
over any backdrop.

### Named Rules

**The Scrim Rule.** Text never sits on raw imagery; a ground-colored gradient scrim always mediates, strong enough to keep AA at the text position.

## Shapes

Two radii only: 0.75rem for plates, cards, inputs, and panels; 9999px for
pills (buttons, chips). Circular icon buttons are 3rem (48px) hit targets
in spacious contexts (hero, nav) and no smaller than 2.75rem (44px, the
WCAG minimum) in tight contexts (a grid-card corner control) — never below
44px. No other radius values.

## Components

- **Primary button:** amber pill, accent-ink text, weight 600, tinted shadow, hover lifts -2px. One per viewport region.
- **Ghost icon button:** 3rem circle, translucent fill + border, hover steps the fill; always has an aria-label.
- **Genre chip:** transparent pill, translucent border, text-muted; hover borders amber with an .08 amber fill. Rendered as links.
- **Fact list:** key/value rows separated by 1px line color; keys text-muted, values weight 400.
- **Cast card:** 2/3 portrait in a 0.75rem plate, name (label), character (muted); hover lifts image -4px.
- **Rec card:** poster with a bottom ground-gradient caption overlay; hover scales image 1.05 inside the clipped plate.
- **Rail header:** kicker left, amber text-link right ("View all →").
- **Nav:** `fixed` overlay over the hero on detail routes (gradient scrim, auto-selected by matching the route against `/^\/(movie|tv)\/\d+$/`), static solid ground elsewhere; wordmark "Flix." with amber period; active link full text color, inactive muted. Movie/TV Shows are `DropdownMenu` triggers; mobile nav is a `Sheet` (right-side drawer).
- **Text field:** label + input pair (`shared/components/ui/TextField`), label always associated via `useId` when no id is passed. Translucent fill/border on ground, amber focus ring via `:focus-visible`.
- **Dialog:** shadcn's Radix `Dialog` (`components/ui/dialog`) — surface-raised panel, `role="dialog"`, real focus trap, Esc closes, backdrop click closes. Every use gives it a `DialogTitle` (visually hidden via `sr-only` where no heading is wanted, e.g. the trailer/full-size-image dialogs).
- **Dropdown menu:** shadcn's Radix `DropdownMenu` (`components/ui/dropdown-menu`) — owns its own `aria-expanded`/id state, closes on Esc/outside-click/item-select. Used for the navbar's Movie/TV menus, the profile menu, and the shared add-to-list menu (`shared/components/List/Menu.tsx`, whose "Add to list" panel is a `DropdownMenuSub`).

## Motion

One authored moment per page: the detail hero backdrop drifts (scale 1.08→1
over 40s, ease-out) behind static content. Everything else is micro:
150–300ms transforms with `cubic-bezier(.2,.9,.3,1)` (hover lifts, image
scales). All motion respects `prefers-reduced-motion: reduce`. Content is
visible by default; nothing animates from opacity 0.

## Do's and Don'ts

### Do:

- **Do** put imagery under every hero and let the scrim system carry legibility.
- **Do** tint all secondary text and translucent chrome from the teal/text family.
- **Do** reserve amber for its three jobs and use accent-ink for text on amber.
- **Do** keep the two-radius system (0.75rem / 9999px) and 3rem minimum icon-button hit targets.
- **Do** ship visible `:focus-visible` amber rings on every interactive element.

### Don't:

- **Don't** use Tailwind gray/slate/zinc utilities on the dark ground — tint from the palette instead.
- **Don't** introduce a second accent or use amber for decoration.
- **Don't** place text on raw imagery without a scrim.
- **Don't** use pure black (#000) or pure white (#fff) as surfaces or text.
- **Don't** reintroduce daisyUI classes or Font Awesome; icons are inline SVG (lucide), chrome is the component library in `shared/components/ui`.
