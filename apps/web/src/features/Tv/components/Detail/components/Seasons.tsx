import { memo } from 'react';

import { Season } from '@/models';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';
import { Rail } from '@/shared/components/ui/Rail';

interface Props {

  /** Seasons to list. */
  readonly seasons: readonly Season[];
}

const SeasonsComponent = ({ seasons }: Props) => {
  if (seasons.length === 0) {
    return null;
  }

  return (
    <Rail title="Seasons">
      <div className="grid auto-cols-[9.5rem] grid-flow-col gap-5 overflow-x-auto pb-4">
        {seasons.map(season => {
          const imageUrl =
            season.posterPath != null ?
              `${IMAGE_BASE_URL}${PosterSizes.medium}${season.posterPath}` :
              '/images/no-image.png';

          return (
            <div key={season.id}>
              <img
                src={imageUrl}
                alt={`${season.name} poster`}
                loading="lazy"
                className="mb-2.5 aspect-2/3 w-full rounded-md object-cover"
              />
              <p className="truncate text-sm font-medium text-foreground">{season.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {season.episodeCount} episode{season.episodeCount !== 1 ? 's' : ''}
              </p>
            </div>
          );
        })}
      </div>
    </Rail>
  );
};

export const Seasons = memo(SeasonsComponent);
