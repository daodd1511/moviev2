import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

import { EpisodeSelection } from './EpisodeMatrix';

import { calculateEpisodeAverage, getQualityBand, QUALITY_BANDS } from '../../utils/seriesQuality';

interface Props {
  /** Currently selected rated episode, or null before selection. */
  readonly selection: EpisodeSelection | null;

  /** TV identifier used by the anchored season link. */
  readonly tvId: number;
}

const comparisonText = (rating: number, average: number | null): string => {
  if (average === null) return 'No rated season average is available.';

  const difference = rating - average;
  if (Math.abs(difference) < 0.05) return 'Matches the season average.';

  return `${difference > 0 ? 'Above' : 'Below'} the season average by ${Math.abs(difference).toFixed(1)} points.`;
};

/** In-place details for the selected rated matrix cell. */
export const EpisodeInspector = ({ selection, tvId }: Props) => {
  if (selection === null) {
    return (
      <aside
        className="flex min-h-72 flex-col justify-center border-t border-border bg-[linear-gradient(145deg,rgba(20,52,58,0.46),rgba(8,28,35,0.3))] p-6 min-[860px]:border-t-0 min-[860px]:border-l min-[860px]:p-8"
        aria-live="polite"
      >
        <p className="text-micro font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Episode inspector
        </p>
        <h2 className="mt-3 text-xl font-light tracking-tight">Select a rated episode</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Choose a numeric cell to compare it with its season and open the matching ledger row.
        </p>
      </aside>
    );
  }

  const seasonAverage = calculateEpisodeAverage([selection.detail]);
  const seasonRatings = selection.detail.episodes.flatMap(episode =>
    episode.voteAverage === null ? [] : [episode.voteAverage],
  );
  const seasonHigh = seasonRatings.length === 0 ? null : Math.max(...seasonRatings);
  const band = getQualityBand(selection.voteAverage);
  const bandLabel = band === 'notRated' ? 'Not rated' : QUALITY_BANDS[band].label;
  const seasonLabel =
    selection.season.seasonNumber === 0 ? 'Specials' : `Season ${selection.season.seasonNumber}`;

  return (
    <aside
      className="flex min-h-72 flex-col justify-center border-t border-border bg-[linear-gradient(145deg,rgba(20,52,58,0.6),rgba(8,28,35,0.35))] p-6 min-[860px]:border-t-0 min-[860px]:border-l min-[860px]:p-8"
      aria-live="polite"
    >
      <p className="text-micro font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {seasonLabel} · Episode {selection.episode.episodeNumber}
      </p>
      <p className="mt-3 inline-flex items-center gap-2 border-y border-primary/30 py-3 text-5xl font-extralight text-primary tabular-nums">
        <Star aria-hidden="true" className="size-6 fill-current" />
        {selection.voteAverage.toFixed(1)}
      </p>
      <h2 className="mt-5 text-lg font-normal tracking-tight">{selection.episode.name}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {bandLabel} · {comparisonText(selection.voteAverage, seasonAverage)}
      </p>
      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border/80 pt-4">
        <div>
          <dt className="text-micro tracking-[0.1em] text-muted-foreground uppercase">
            Season avg.
          </dt>
          <dd className="mt-1 text-base tabular-nums">{seasonAverage?.toFixed(1) ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-micro tracking-[0.1em] text-muted-foreground uppercase">
            Season high
          </dt>
          <dd className="mt-1 text-base tabular-nums">{seasonHigh?.toFixed(1) ?? '—'}</dd>
        </div>
      </dl>
      <Link
        to={`/tv/${tvId}/season/${selection.season.seasonNumber}#episode-${selection.episode.episodeNumber}`}
        className="mt-6 inline-flex items-center gap-1.5 self-start border-b border-primary/40 pb-1 text-sm font-medium text-primary transition-colors hover:border-primary hover:text-foreground"
      >
        View in Season
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </Link>
    </aside>
  );
};
