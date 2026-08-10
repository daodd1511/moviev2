import { QualityBand, QUALITY_BANDS } from '../../utils/seriesQuality';

const BAND_ORDER: readonly QualityBand[] = [
  'awesome',
  'great',
  'good',
  'regular',
  'bad',
  'garbage',
];

/** Shared matrix and legend presentation for each fixed quality band. */
export const QUALITY_BAND_STYLES: Readonly<
  Record<QualityBand, { readonly cell: string; readonly swatch: string }>
> = {
  awesome: { cell: 'bg-[#128957] text-foreground', swatch: 'bg-[#128957]' },
  great: { cell: 'bg-[#24b56e] text-[#071219]', swatch: 'bg-[#24b56e]' },
  good: { cell: 'bg-[#e6b936] text-[#071219]', swatch: 'bg-[#e6b936]' },
  regular: { cell: 'bg-[#e88d20] text-[#071219]', swatch: 'bg-[#e88d20]' },
  bad: { cell: 'bg-[#cf514a] text-foreground', swatch: 'bg-[#cf514a]' },
  garbage: { cell: 'bg-[#78558d] text-foreground', swatch: 'bg-[#78558d]' },
};

/** Fixed quality-band legend for the episode matrix. */
export const QualityLegend = () => (
  <ul
    aria-label="Episode quality bands"
    className="flex flex-wrap gap-x-3 gap-y-2 rounded-sm border border-foreground/10 bg-surface-raised/60 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(217,231,238,0.04)]"
  >
    {BAND_ORDER.map(band => (
      <li
        key={band}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <span
          aria-hidden="true"
          className={`size-2.5 rounded-full ${QUALITY_BAND_STYLES[band].swatch}`}
        />
        {QUALITY_BANDS[band].label}
      </li>
    ))}
  </ul>
);
