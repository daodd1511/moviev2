import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { MovieList, Loader } from '@/shared/components';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { MovieQueries } from '@/stores/queries/movieQueries';

const MovieByGenreComponent = () => {
  const params = useParams();
  const genreId = parseInt(params.genreId ?? '', 10);
  const { data: genres } = MovieQueries.useGenres();
  const title = genres?.find(genre => genre.id === genreId)?.name ?? 'Genre';
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
  } = MovieQueries.useInfiniteListByGenre(genreId);

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
    return <Loader />;
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
        {hasNextPage !== undefined && isFetchingNextPage && <Loader />}
      </div>
    </div>
  );
};

export const MovieByGenre = memo(MovieByGenreComponent);
