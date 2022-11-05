import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { MovieService } from '@/api/services/movieService';
import { Loader } from '@/shared/components';
import { Pagination, Movie } from '@/models';
import { MovieList } from '@/shared/components/Movie/MovieList';
import { MOVIE_DISCOVER } from '@/shared/constants';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';

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
  } = useInfiniteQuery<Pagination<Movie>, AxiosError>(
    [`${title} movies`, discover],
    ({ pageParam = 1 }) => MovieService.getMovies(pageParam, discover),
    {
      getNextPageParam(lastPage) {
        const nextPage = lastPage.page + 1;
        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    },
  );

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
      <h1 className="pb-10 text-2xl font-medium">{title} Movies</h1>
      {data.pages.map((moviePage, i) => (
        <MovieList key={i} movies={moviePage.results} />
      ))}
      <div className="loader" ref={observerElement}>
        {hasNextPage !== undefined && isFetchingNextPage && <Loader />}
      </div>
    </div>
  );
};

export const MovieByDiscover = memo(MovieByDiscoverComponent);
