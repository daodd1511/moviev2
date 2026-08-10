import { ChangeEvent, memo } from 'react';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { SeasonDetail as SeasonDetailModel, TvDetail } from '@/models';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { BackdropSizes, PosterSizes } from '@/shared/enums';

interface Props {
  /** TV detail used for identity, artwork, and available seasons. */
  readonly tv: TvDetail;

  /** Current season and its loaded metadata. */
  readonly season: SeasonDetailModel;
}

const getSeasonLabel = (seasonNumber: number, name: string): string =>
  seasonNumber === 0 ? 'Specials' : name;

const getSeasonMeta = (episodeCount: number, airDate: string | null): string => {
  const episodeLabel = `${episodeCount} episode${episodeCount === 1 ? '' : 's'}`;

  if (airDate === null) {
    return episodeLabel;
  }

  const year = new Date(airDate).getFullYear();
  return Number.isNaN(year) ? episodeLabel : `${episodeLabel} · ${year}`;
};

const SeasonHeroComponent = ({ tv, season }: Props) => {
  const navigate = useNavigate();
  const currentSeasonIndex = tv.seasons.findIndex(
    candidate => candidate.seasonNumber === season.seasonNumber,
  );
  const previousSeason = currentSeasonIndex > 0 ? tv.seasons[currentSeasonIndex - 1] : undefined;
  const nextSeason =
    currentSeasonIndex !== -1 && currentSeasonIndex < tv.seasons.length - 1
      ? tv.seasons[currentSeasonIndex + 1]
      : undefined;
  const posterUrl =
    season.posterPath !== null
      ? `${IMAGE_BASE_URL}${PosterSizes.large}${season.posterPath}`
      : '/images/no-image.png';
  const backdropUrl =
    tv.backdropPath !== null ? `${IMAGE_BASE_URL}${BackdropSizes.large}${tv.backdropPath}` : null;
  const seasonLabel = getSeasonLabel(season.seasonNumber, season.name);

  const handleSeasonChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    navigate(`/tv/${tv.id}/season/${event.target.value}`);
  };

  const handlePreviousSeason = (): void => {
    if (previousSeason !== undefined) {
      navigate(`/tv/${tv.id}/season/${previousSeason.seasonNumber}`);
    }
  };

  const handleNextSeason = (): void => {
    if (nextSeason !== undefined) {
      navigate(`/tv/${tv.id}/season/${nextSeason.seasonNumber}`);
    }
  };

  return (
    <>
      <header
        className="relative isolate overflow-hidden border-b border-border/60 bg-surface"
        aria-labelledby="season-title"
      >
        {backdropUrl !== null ? (
          <div
            role="img"
            aria-label={`${tv.name} backdrop`}
            className="absolute inset-0 -z-10 hidden bg-cover opacity-60 min-[860px]:block min-[860px]:[background-position:center_20%]"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />
        ) : null}
        <div className="absolute inset-0 -z-10 hidden bg-gradient-to-t from-background via-background/75 to-background/30 min-[860px]:block" />
        <div className="mx-auto flex w-full max-w-[82rem] items-end gap-4 px-5 py-10 min-[590px]:gap-7 min-[860px]:min-h-[31rem] min-[860px]:gap-9 min-[860px]:px-12 min-[860px]:pt-28 min-[860px]:pb-12">
          <img
            src={posterUrl}
            alt={`${seasonLabel} poster`}
            className="w-[5.5rem] shrink-0 rounded-md object-cover shadow-[0_24px_48px_-12px_rgba(0,0,0,0.72)] outline outline-1 outline-foreground/15 min-[590px]:w-28 min-[860px]:w-42"
          />
          <div className="max-w-3xl min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-micro font-medium tracking-[0.14em] text-muted-foreground uppercase"
            >
              <Link to={`/tv/${tv.id}`} className="transition-colors hover:text-foreground">
                {tv.name}
              </Link>
              <span aria-hidden="true" className="text-border">
                /
              </span>
              <span>{seasonLabel}</span>
            </nav>
            <h1
              id="season-title"
              className="text-[clamp(2.1rem,6vw,4.75rem)] leading-[1.02] font-extralight tracking-[0.015em] min-[860px]:uppercase"
            >
              {seasonLabel}
            </h1>
            {season.overview !== '' ? (
              <p className="mt-4 hidden max-w-[58ch] text-sm leading-relaxed text-muted-foreground min-[860px]:block">
                {season.overview}
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <div className="relative z-1 mx-auto -mt-5 flex w-full max-w-[82rem] items-center gap-3 px-5 min-[590px]:-mt-6 min-[860px]:px-12">
        <div className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-md border border-foreground/15 bg-surface-raised px-3 shadow-[0_16px_40px_-18px_rgba(0,0,0,0.85)] min-[590px]:px-4">
          <label
            htmlFor="season-picker"
            className="hidden text-micro font-medium tracking-[0.16em] text-muted-foreground uppercase min-[590px]:block"
          >
            Viewing
          </label>
          <select
            id="season-picker"
            value={season.seasonNumber}
            onChange={handleSeasonChange}
            className="min-w-0 flex-1 rounded-sm bg-foreground/[0.08] px-3 py-2 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring min-[590px]:max-w-56"
          >
            {tv.seasons.map(candidate => (
              <option key={candidate.id} value={candidate.seasonNumber}>
                {getSeasonLabel(candidate.seasonNumber, candidate.name)}
              </option>
            ))}
          </select>
          <span className="hidden text-xs tracking-[0.08em] text-muted-foreground uppercase min-[860px]:inline">
            {getSeasonMeta(season.episodes.length, season.airDate)}
          </span>
        </div>
        <Button
          asChild
          type="button"
          variant="outline"
          size="icon-sm"
          className="shrink-0 min-[590px]:h-9 min-[590px]:w-auto min-[590px]:px-3"
        >
          <Link to={`/tv/${tv.id}/quality`} aria-label="Open Series quality">
            <BarChart3 aria-hidden="true" />
            <span className="hidden min-[590px]:inline">Series quality</span>
          </Link>
        </Button>
        <div className="flex shrink-0 gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Previous season"
            disabled={previousSeason === undefined}
            onClick={handlePreviousSeason}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Next season"
            disabled={nextSeason === undefined}
            onClick={handleNextSeason}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </>
  );
};

export const SeasonHero = memo(SeasonHeroComponent);
