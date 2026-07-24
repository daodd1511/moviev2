import { memo } from 'react';
import { Link } from 'react-router-dom';

import { MediaType } from '../enums/mediaType';

import { Loader } from '@/shared/components';
import { TvQueries } from '@/stores/queries/tvQueries';
import { MovieQueries } from '@/stores/queries/movieQueries';
import { Rail } from '@/shared/components/ui/Rail';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';

interface Props {

  /** Media id. */
  readonly mediaId: number;

  /** Media type. */
  readonly mediaType: MediaType;
}

const RecommendComponent = ({ mediaId, mediaType }: Props) => {
  const { data, isLoading, isError, error } = mediaType === MediaType.Tv ? TvQueries.useRecommendations(mediaId) : MovieQueries.useRecommendations(mediaId);

  if (isLoading) {
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
      <div className="grid grid-cols-2 gap-5 md:grid-cols-5">
        {data.results.map(media => {
          const imageUrl =
            media.posterPath != null ?
              `${IMAGE_BASE_URL}${PosterSizes.large}${media.posterPath}` :
              '/images/no-image.png';

          return (
            <Link key={media.id} to={`/${media.type}/${media.id}`} className="group relative block overflow-hidden rounded-md">
              <img
                src={imageUrl}
                alt={media.title}
                loading="lazy"
                className="aspect-2/3 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent px-3.5 pb-3 pt-9 text-sm font-medium text-foreground">
                {media.title}
              </span>
            </Link>
          );
        })}
      </div>
    </Rail>
  );
};

export const Recommend = memo(RecommendComponent);
