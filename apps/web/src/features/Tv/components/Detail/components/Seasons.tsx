import { memo } from 'react';
import { Link } from 'react-router-dom';

import { Season } from '@/models';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';
import { Rail } from '@/shared/components/ui/Rail';

interface Props {
  /** Seasons to list. */
  readonly seasons: readonly Season[];

  /** TV identifier used by season routes. */
  readonly tvId: number;
}

const seasonLabel = (season: Season): string =>
  season.seasonNumber === 0 ? 'Specials' : season.name;

const SeasonsComponent = ({ seasons, tvId }: Props) => {
  if (seasons.length === 0) {
    return null;
  }

  return (
    <Rail title="Seasons">
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] md:gap-5 md:overflow-visible md:px-0">
        {seasons.map(season => {
          const imageUrl =
            season.posterPath != null
              ? `${IMAGE_BASE_URL}${PosterSizes.medium}${season.posterPath}`
              : '/images/no-image.png';

          return (
            <Link
              key={season.id}
              to={`/tv/${tvId}/season/${season.seasonNumber}`}
              className="group w-32 shrink-0 snap-start focus-visible:rounded-md md:w-auto"
              aria-label={`Open ${seasonLabel(season)}`}
            >
              <img
                src={imageUrl}
                alt={`${seasonLabel(season)} poster`}
                loading="lazy"
                className="mb-2.5 aspect-2/3 w-full rounded-md object-cover transition-transform duration-200 group-hover:-translate-y-1"
              />
              <p className="truncate text-sm font-medium text-foreground">{seasonLabel(season)}</p>
              <p className="truncate text-xs text-muted-foreground">
                {season.episodeCount} episode{season.episodeCount !== 1 ? 's' : ''}
              </p>
            </Link>
          );
        })}
      </div>
    </Rail>
  );
};

export const Seasons = memo(SeasonsComponent);
