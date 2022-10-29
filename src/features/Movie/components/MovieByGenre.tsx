import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { MovieService } from '../../../api/services/movieService';
import { Pagination, Movie } from '../../../models';
import { MovieList, Spinner } from '../../../shared/components';
import { useInfiniteScroll } from '../../../shared/hooks/useInfiniteScroll';

const MovieByGenreComponent = () => {
  const params = useParams();
  const genreId = parseInt(params.genreId ?? '', 10);
  const { data: genres } = useQuery(['moviesByGenre'], () =>
    MovieService.getGenres());
  const title = genres?.find(genre => genre.id === genreId)?.name ?? 'Genre';
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<Pagination<Movie>, AxiosError>(
    ['moviesByGenre', genreId],
    ({ pageParam = 1 }) => MovieService.getMoviesByGenre(genreId, pageParam),
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
    return <Spinner />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div className="px-8 py-12">
      <h1 className="pb-10 text-2xl font-medium">{title}</h1>
      {data.pages.map((moviePage, i) => (
        <MovieList key={i} movies={moviePage.results} />
      ))}
      <div className="loader" ref={observerElement}>
        {hasNextPage !== undefined && isFetchingNextPage && <Spinner />}
      </div>
    </div>
  );
};

export const MovieByGenre = memo(MovieByGenreComponent);
