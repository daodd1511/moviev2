import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { memo } from 'react';

import { TvService } from '../../../api/services/tvService';
import { Spinner, TvList } from '../../../shared/components';
import { Pagination, Tv } from '../../../core/models';

interface Props {

  /** Tv id. */
  readonly tvId: number;
}

const RecommendComponent = ({ tvId }: Props) => {
  const { data, isLoading, isError, error } = useQuery<
    Pagination<Tv>,
    AxiosError
  >(['tvRecommend', tvId], () => TvService.getTvRecommendation(tvId));

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h3 className="mb-6 text-3xl font-medium ">Recommendations</h3>
      <TvList tvs={data.results} />
    </div>
  );
};

export const Recommend = memo(RecommendComponent);
