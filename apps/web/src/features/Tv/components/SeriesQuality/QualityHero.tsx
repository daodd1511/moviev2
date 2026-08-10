import { Star } from 'lucide-react';

import { TvDetail } from '@/models';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { BackdropSizes, PosterSizes } from '@/shared/enums';

interface Props {
  /** Calculated mean across the currently visible loaded episode columns. */
  readonly episodeAverage: number | null;

  /** Count of episodes represented by visible loaded columns. */
  readonly episodeCount: number;

  /** Whether the TV detail exposes Season 0. */
  readonly hasSpecials: boolean;

  /** Whether the Specials column is currently visible. */
  readonly showSpecials: boolean;

  /** TV identity and public series rating. */
  readonly tv: TvDetail;

  /** Updates the Specials visibility and fetch state. */
  readonly onShowSpecialsChange: (checked: boolean) => void;
}

const QualityHero = ({
  episodeAverage,
  episodeCount,
  hasSpecials,
  showSpecials,
  tv,
  onShowSpecialsChange,
}: Props) => {
  const posterUrl =
    tv.posterPath !== null
      ? `${IMAGE_BASE_URL}${PosterSizes.large}${tv.posterPath}`
      : '/images/no-image.png';
  const backdropUrl =
    tv.backdropPath !== null ? `${IMAGE_BASE_URL}${BackdropSizes.large}${tv.backdropPath}` : null;
  const regularSeasonCount = tv.seasons.filter(season => season.seasonNumber > 0).length;

  return (
    <header
      className="relative isolate overflow-hidden border-b border-border/60 bg-surface"
      aria-labelledby="series-quality-title"
    >
      {backdropUrl !== null ? (
        <div
          role="img"
          aria-label={`${tv.name} backdrop`}
          className="absolute inset-0 -z-10 hidden bg-cover opacity-55 min-[860px]:block min-[860px]:[background-position:center_25%]"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      ) : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/78 to-background/25" />
      <div className="mx-auto flex min-h-72 w-full max-w-[82rem] items-end gap-4 px-5 py-10 min-[590px]:gap-7 min-[860px]:min-h-[28rem] min-[860px]:gap-9 min-[860px]:px-12 min-[860px]:pt-28 min-[860px]:pb-12">
        <img
          src={posterUrl}
          alt={`${tv.name} poster`}
          className="w-[5.5rem] shrink-0 rounded-md object-cover shadow-[0_24px_48px_-12px_rgba(0,0,0,0.72)] outline outline-1 outline-foreground/15 min-[590px]:w-28 min-[860px]:w-38"
        />
        <div className="min-w-0 flex-1">
          <p className="text-micro font-medium tracking-[0.2em] text-primary uppercase">
            Series quality
          </p>
          <h1
            id="series-quality-title"
            className="mt-2 max-w-[15ch] text-[clamp(2rem,6vw,4.75rem)] leading-[1.02] font-extralight tracking-[0.015em] min-[860px]:uppercase"
          >
            {tv.name}
          </h1>
          <p className="mt-3 text-xs tracking-[0.08em] text-muted-foreground uppercase">
            {regularSeasonCount} season{regularSeasonCount === 1 ? '' : 's'} · {episodeCount}{' '}
            visible episode{episodeCount === 1 ? '' : 's'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <div className="min-w-36 rounded-md border border-foreground/15 bg-foreground/[0.055] px-3.5 py-2.5 backdrop-blur-sm">
              <span className="block text-micro font-medium tracking-[0.11em] text-muted-foreground uppercase">
                Series rating
              </span>
              <strong className="mt-0.5 inline-flex items-center gap-1 text-lg font-normal text-primary">
                <Star aria-hidden="true" className="size-4 fill-current" />
                {tv.voteAverage.toFixed(1)}
              </strong>
            </div>
            <div className="min-w-36 rounded-md border border-foreground/15 bg-foreground/[0.055] px-3.5 py-2.5 backdrop-blur-sm">
              <span className="block text-micro font-medium tracking-[0.11em] text-muted-foreground uppercase">
                Episode average
              </span>
              <strong className="mt-0.5 inline-flex items-center gap-1 text-lg font-normal text-primary">
                <Star aria-hidden="true" className="size-4 fill-current" />
                {episodeAverage === null ? 'Not rated' : episodeAverage.toFixed(1)}
              </strong>
            </div>
          </div>
        </div>
      </div>
      {hasSpecials ? (
        <label className="absolute right-5 bottom-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-foreground/15 bg-background/70 px-3.5 py-2 text-xs font-medium text-muted-foreground backdrop-blur-md transition-colors has-checked:border-foreground/35 has-checked:text-foreground min-[860px]:right-12 min-[860px]:bottom-8">
          <input
            type="checkbox"
            checked={showSpecials}
            onChange={event => onShowSpecialsChange(event.target.checked)}
            className="size-3.5 accent-primary"
          />
          Show Specials
        </label>
      ) : null}
    </header>
  );
};

export { QualityHero };
