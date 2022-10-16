import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { MovieService } from '../../../api/services/movieService';
import { Spinner } from '../../../shared/components';
import { Pagination, Movie } from '../../../core/models';
import { MovieList } from '../../../shared/components/MovieList';
import { DISCOVER } from '../../../core/constants';

const MovieByDiscoverComponent = () => {
  const { discover } = useParams();
  const title = DISCOVER.find(item => item.value === discover)?.name ?? 'Discover';
  const {
    data: movies,
    isLoading,
    isError,
    error,
  } = useQuery<Pagination<Movie>, AxiosError>(
    ['moviesByDiscover', discover],
    () => MovieService.getMovies(discover),
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
      <MovieList movies={movies.results}/>
    </div>
  );
};

export const MovieByDiscover = memo(MovieByDiscoverComponent);
