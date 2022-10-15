import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { AxiosError } from 'axios';

import { MovieService } from '../../api/services/movieService';
import { Movie } from '../../core/models/movie/movie.model';

const MoviesComponent = () => {
  const header = 'Movies';
  const {
    data: movies,
    isLoading,
    isError,
    error,
  } = useQuery<readonly Movie[], AxiosError>(
    ['movies'],
    MovieService.getMovies,
  );
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl text-red-500">{header}</h1>
      <button className="btn btn-secondary">Click me!</button>
      {movies.map(movie => (
        <div key={movie.id}>{movie.title}</div>
      ))}
    </div>
  );
};

export const Movies = memo(MoviesComponent);
