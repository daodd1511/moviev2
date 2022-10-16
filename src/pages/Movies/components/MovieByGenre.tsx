import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { MovieService } from '../../../api/services/movieService';
import { Pagination, Movie } from '../../../core/models';
import { MovieList, Spinner } from '../../../shared/components';

import { Type } from '../../../core/enums';

const MovieByGenreComponent = () => {
  const params = useParams();
  const genreId = parseInt(params.genreId ?? '', 10);
  const { data: genres } = useQuery(['genres'], () => MovieService.getGenres(Type.Movie));
  const title = genres?.find(genre => genre.id === genreId)?.name ?? 'Genre';
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
    return <div><Spinner /></div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div className="px-8 py-12">
      <h1 className="text-2xl font-medium pb-10">{title}</h1>
      <MovieList movies={movies.results} />
    </div>
  );
};

export const MovieByGenre = memo(MovieByGenreComponent);
