import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

import { MediaType } from '../enums/mediaType';

import { Loader } from '@/shared/components';
import { TvQueries } from '@/stores/queries/tvQueries';
import { MovieQueries } from '@/stores/queries/movieQueries';
import { Rail } from '@/shared/components/ui/Rail';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';
import { formatToYear } from '@/shared/utils';

interface Props {
  /** Media id. */
  readonly mediaId: number;

  /** Media type. */
  readonly mediaType: MediaType;
}

const RecommendComponent = ({ mediaId, mediaType }: Props) => {
  const { data, isPending, isError, error } =
    mediaType === MediaType.Tv
      ? TvQueries.useRecommendations(mediaId)
      : MovieQueries.useRecommendations(mediaId);

  if (isPending) {
    return <Loader />;
  }

  if (isError) {
    return <div className="pt-14 text-destructive">Error: {error.message}</div>;
  }

  if (data.results.length === 0) {
    return null;
  }

  return (
    <Rail title="More Like This">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-5">
        {data.results.map(media => {
          const imageUrl =
            media.posterPath != null
              ? `${IMAGE_BASE_URL}${PosterSizes.large}${media.posterPath}`
              : '/images/no-image.png';

          return (
            <Link
              key={media.id}
              to={`/${media.type}/${media.id}`}
              className="group relative block overflow-hidden rounded-md"
            >
              <img
                src={imageUrl}
                alt={media.title}
                loading="lazy"
                className="aspect-2/3 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent px-3.5 pt-9 pb-3">
                <p className="truncate text-sm font-medium text-foreground">{media.title}</p>
                <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatToYear(media.releaseDate)}</span>
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Star aria-hidden="true" className="h-3 w-3 fill-current" />
                    {media.voteAverage.toFixed(1)}
                  </span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </Rail>
  );
};

export const Recommend = memo(RecommendComponent);
