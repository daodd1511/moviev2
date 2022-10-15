import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { MovieService } from '../../api/services/Movie';

const MoviesComponent = () => {
  const header = 'Movies';
  const { data: movies, isLoading, isError, error } = useQuery(['movies'], MovieService.getMovies);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: { error.message }</div>;
  }
  return (
    <div>
      <h1 className="text-2xl text-red-500">{header}</h1>
      <button className="btn btn-secondary">Click me!</button>
      {movies.results.map(movie => (<div key={movie.id}>{movie.title}</div>))}
    </div>
  );
};

export const Movies = memo(MoviesComponent);
