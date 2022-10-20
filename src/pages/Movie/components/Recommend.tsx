import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { memo } from 'react';

import { MovieService } from '../../../api/services/movieService';
import { MovieList, Spinner } from '../../../shared/components';
import { Movie, Pagination } from '../../../core/models';

interface Props {

  /** Movie id. */
  readonly movieId: number;
}

const RecommendComponent = ({ movieId }: Props) => {
  const { data, isLoading, isError, error } = useQuery<
    Pagination<Movie>,
    AxiosError
  >(['recommend', movieId], () => MovieService.getMovieRecommendation(movieId));

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h3 className="mb-6 text-3xl font-medium ">Recommendations</h3>
      <MovieList movies={data.results} />
    </div>
  );
};

export const Recommend = memo(RecommendComponent);
