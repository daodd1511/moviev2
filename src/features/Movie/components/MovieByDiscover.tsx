import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { Loader } from '@/shared/components';
import { MediaList } from '@/shared/components/';
import { MOVIE_DISCOVER } from '@/shared/constants';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { MovieQueries } from '@/stores/queries/movieQueries';

const MovieByDiscoverComponent = () => {
  const { discover } = useParams();
  const title =
    MOVIE_DISCOVER.find(item => item.value === discover)?.name ?? 'Discover';
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
  } = MovieQueries.useInfiniteListByDiscover(discover ?? '');

  const { observerElement } = useInfiniteScroll(
    {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    },
    fetchNextPage,
    hasNextPage,
  );

  if (isLoading) {
    return <Loader className="h-withoutNavbar" />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div className="px-8 py-12">
      <h1 className="pb-10">{title} Movies</h1>
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
