import { memo } from 'react';

import { FilmList, Loader } from '@/shared/components';
import { MovieQueries } from '@/stores/queries/movieQueries';

interface Props {

  /** Movie id. */
  readonly movieId: number;
}

const RecommendComponent = ({ movieId }: Props) => {
  const { data, isLoading, isError, error } = MovieQueries.useRecommendations(movieId);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h3 className="mb-6 text-3xl font-extralight text-slate-700 ">Recommendations</h3>
      {data?.results.length !== 0 ?
        (
          <FilmList data={data.results} />
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
