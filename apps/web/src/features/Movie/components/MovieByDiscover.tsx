import { memo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { DiscoverTabs, Loader } from '@/shared/components';
import { MediaList } from '@/shared/components/';
import { MOVIE_DISCOVER } from '@/shared/constants';
import { CatalogQueries } from '@/stores/queries/catalogQueries';
import { Media } from '@/models/media.model';
import { MediaType } from '@/shared/enums/mediaType';
import { CatalogFilters } from '@/shared/components/Filter/CatalogFilters';

const MovieByDiscoverComponent = () => {
  const { discover } = useParams();
  const [params] = useSearchParams();
  const title = MOVIE_DISCOVER.find(item => item.value === discover)?.name ?? 'Discover';
  const { data, isPending, isError, error, refetch } = CatalogQueries.useDiscover({
    mediaType: 'movie',
    page: Number(params.get('page')) || 1,
    sort_by: params.get('sort') ?? undefined,
    with_genres: params.get('genres') ?? undefined,
  });

  if (isPending) {
    return <Loader className="min-h-[60vh]" />;
  }

  if (isError) {
    return (
      <div>
        <p role="alert">Error: {error.message}</p>
        <button type="button" onClick={() => void refetch()}>
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="px-4 py-8 md:px-8 md:py-12">
      <h1 className="pb-6 text-2xl font-semibold md:pb-10">{title} Movies</h1>
      <DiscoverTabs
        label="Movie categories"
        basePath="/movie/discover"
        activeValue={discover ?? 'popular'}
        options={MOVIE_DISCOVER}
      />
      <CatalogFilters mediaType="movie" />
      <MediaList
        data={(data?.results ?? [])
          .filter(
            (item): item is Extract<typeof item, { mediaType: 'movie' | 'tv' }> =>
              item.mediaType !== 'person',
          )
          .map(
            item =>
              new Media({
                id: item.id,
                title: item.title,
                posterPath: item.posterPath,
                releaseDate: item.releaseDate,
                voteAverage: item.voteAverage,
                type: MediaType.Movie,
              }),
          )}
      />
    </div>
  );
};

export const MovieByDiscover = memo(MovieByDiscoverComponent);
