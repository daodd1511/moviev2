import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { DiscoverTabs, Loader } from '@/shared/components';
import { MediaList } from '@/shared/components/';
import { MOVIE_DISCOVER } from '@/shared/constants';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { MovieQueries } from '@/stores/queries/movieQueries';

const MovieByDiscoverComponent = () => {
  const { discover } = useParams();
  const title = MOVIE_DISCOVER.find(item => item.value === discover)?.name ?? 'Discover';

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage, isPending, isError, error } =
    MovieQueries.useInfiniteListByDiscover(discover ?? '');

  const { observerElement } = useInfiniteScroll(
    {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    },
    () => void fetchNextPage(),
    hasNextPage,
  );

  if (isPending) {
    return <Loader className="min-h-[60vh]" />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
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
      {data.pages.map(moviePage => (
        <MediaList key={moviePage.page} data={moviePage.results} />
      ))}
      <div className="loader" ref={observerElement}>
        {hasNextPage !== undefined && isFetchingNextPage && <Loader />}
      </div>
    </div>
  );
};

export const MovieByDiscover = memo(MovieByDiscoverComponent);
