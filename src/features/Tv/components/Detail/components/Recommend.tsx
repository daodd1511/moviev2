import { memo } from 'react';

import { Loader, FilmList } from '@/shared/components';
import { TvQueries } from '@/stores/queries/tvQueries';

interface Props {

  /** Tv id. */
  readonly tvId: number;
}

const RecommendComponent = ({ tvId }: Props) => {
  const { data, isLoading, isError, error } = TvQueries.useRecommendations(tvId);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h3 className="mb-6 text-3xl font-extralight text-slate-700 ">Recommendations</h3>
      <FilmList data={data.results} />
    </div>
  );
};

export const Recommend = memo(RecommendComponent);
