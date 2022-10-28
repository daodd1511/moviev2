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
  >(['movieRecommend', movieId], () =>
    MovieService.getMovieRecommendation(movieId));

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h3 className="mb-6 text-3xl font-extralight text-slate-700 ">Recommendations</h3>
      {data?.results.length !== 0 ?
        (
          <MovieList movies={data.results} />
        ) :
        (
          <div className="text-center text-2xl font-medium">
          No Recommendations
          </div>
        )}
    </div>
  );
};

export const Recommend = memo(RecommendComponent);
