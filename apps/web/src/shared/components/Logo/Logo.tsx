import { useId } from 'react';

/**
 * The brand mark: a projector lens throwing a cone of light rightward.
 *
 * Drawn on a 64-unit grid. The cone's far edge is an outward arc, not a flat cut —
 * a flat cut plus the lens ring reads as a megaphone. The arc peaks at x=57.9, inside
 * the viewBox; pushing it further clips against the box edge.
 *
 * Purely decorative (`aria-hidden`): every consumer pairs it with the wordmark or an
 * `aria-label` on its own wrapper, so a second accessible name here would be noise.
 *
 * @param className Sizing/colour classes. Defaults to `size-6`; in a lockup pass an
 * `em`-relative size so the mark scales with the wordmark.
 */
export const LogoMark = ({ className = 'size-6' }: { readonly className?: string }) => {
  // The gradient id must be unique per instance — the mark renders more than once per page.
  const beamId = useId();

  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={beamId} gradientUnits="userSpaceOnUse" x1="20" y1="0" x2="58" y2="0">
          <stop offset="0" stopColor="var(--color-primary)" stopOpacity="0.95" />
          <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <path
        d="M20 32 L48 8 A34 34 0 0 1 48 56 Z"
        fill={`url(#${beamId})`}
        stroke={`url(#${beamId})`}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Stroked rather than two stacked discs, so the lens aperture is a real hole and
          picks up whatever sits behind the mark. */}
      <circle
        cx="11"
        cy="32"
        r="5.15"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="4.7"
      />
    </svg>
  );
};

/**
 * The full lockup: mark plus the "Flix." wordmark.
 *
 * The wordmark keeps its incumbent treatment — sentence case, weight 600, wide tracking —
 * with the accent period. It deliberately does not use the hairline uppercase display
 * treatment: at nav scale weight 200 goes soft against the mark's solid amber.
 *
 * @param className Root classes. Set the font size here: the mark is sized in `em`, so
 * both halves scale from one declaration.
 */
export const Logo = ({ className = 'text-xl' }: { readonly className?: string }) => (
  <span className={`inline-flex items-center gap-2 ${className}`}>
    <LogoMark className="size-[1.55em] shrink-0" />
    <span className="leading-none font-semibold tracking-wide">
      Flix<span className="text-primary">.</span>
    </span>
  </span>
);
