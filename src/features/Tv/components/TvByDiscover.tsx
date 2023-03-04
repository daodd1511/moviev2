import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { Loader, MediaList } from '@/shared/components';
import { TV_DISCOVER } from '@/shared/constants';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { TvQueries } from '@/stores/queries/tvQueries';

const TvByDiscoverComponent = () => {
  const { discover } = useParams();
  const title =
    TV_DISCOVER.find(item => item.value === discover)?.name ?? 'Discover';
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
  } = TvQueries.useInfiniteListByDiscover(discover);

  const { observerElement } = useInfiniteScroll(
    {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    },
    fetchNextPage,
    hasNextPage,
  );

  if (isLoading) {
    return <Loader className="h-withoutNavbar"/>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div className="px-8 py-12">
      <h1 className="pb-10">{title} TV Shows</h1>
      {data.pages.map((tvPage, i) => (
        <MediaList key={i} data={tvPage.results} />
      ))}
      <div className="loader" ref={observerElement}>
        {hasNextPage !== undefined && isFetchingNextPage && <Loader />}
      </div>
    </div>
  );
};

export const TvByDiscover = memo(TvByDiscoverComponent);
