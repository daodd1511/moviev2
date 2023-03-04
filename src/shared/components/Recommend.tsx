import { memo } from 'react';

import { MediaType } from '../enums/mediaType';

import { Loader, MediaList } from '@/shared/components';
import { TvQueries } from '@/stores/queries/tvQueries';

interface Props {

  /** Media id. */
  readonly mediaId: number;

  /** Media type. */
  readonly mediaType: MediaType;
}

const RecommendComponent = ({ mediaId, mediaType }: Props) => {
  const { data, isLoading, isError, error } = mediaType === MediaType.Tv ? TvQueries.useRecommendations(mediaId) : TvQueries.useRecommendations(mediaId);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="pt-10">
      <h3 className="mb-6 text-3xl font-extralight text-slate-700 ">Recommendations</h3>
      <MediaList data={data.results} />
    </div>
  );
};

export const Recommend = memo(RecommendComponent);
