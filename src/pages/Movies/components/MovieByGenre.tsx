import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { MovieService } from '../../../api/services/movieService';
import { Pagination, Movie } from '../../../core/models';
import { MovieList } from '../../../shared/components/MovieList';

const MovieByGenreComponent = () => {
  const params = useParams();
  const genreId = parseInt(params.genreId ?? '', 10);
  const {
    data: movies,
    isLoading,
    isError,
    error,
  } = useQuery<Pagination<Movie>, AxiosError>(
    ['moviesByGenre', genreId],
    () => MovieService.getMoviesByGenre(genreId),
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <MovieList movies={movies.results} title="Genre"/>
  );
};

export const MovieByGenre = memo(MovieByGenreComponent);
