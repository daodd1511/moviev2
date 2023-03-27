import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { Loader } from '@/shared/components';
import { MediaList } from '@/shared/components/';
import { MOVIE_DISCOVER } from '@/shared/constants';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { MovieQueries } from '@/stores/queries/movieQueries';
import { MovieQueryParams } from '@/models/movie/movieQueryParams.model';
import { SortBy, SortOrder } from '@/shared/enums/sort';
import { SORT_OPTIONS } from '@/shared/constants/sort';
import { Filter } from '@/shared/components/Filter';

const MovieByDiscoverComponent = () => {
  const { discover } = useParams();
  const title =
    MOVIE_DISCOVER.find(item => item.value === discover)?.name ?? 'Discover';
  const defaultQueryParams: MovieQueryParams = {
    page: 1,
    sortBy: SortBy.Popularity,
    sortOrder: SortOrder.Desc,
  };
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
  } = MovieQueries.useInfiniteListTest(defaultQueryParams);

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

      <Filter />
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
