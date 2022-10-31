import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { TvService } from '@/api/services/tvService';
import { Spinner, TvList } from '@/shared/components';
import { Pagination, Tv } from '@/models';
import { TV_DISCOVER } from '@/shared/constants';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';

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
  } = useInfiniteQuery<Pagination<Tv>, AxiosError>(
    ['tvsByDiscover', discover],
    ({ pageParam = 1 }) => TvService.getTvs(pageParam, discover),
    {
      getNextPageParam(lastPage) {
        const nextPage = lastPage.page + 1;
        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    },
  );

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
    return <Spinner />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div className="px-8 py-12">
      <h1 className="pb-10 text-2xl font-medium">{title}</h1>
      {data.pages.map((tvPage, i) => (
        <TvList key={i} tvs={tvPage.results} />
      ))}
      <div className="loader" ref={observerElement}>
        {hasNextPage !== undefined && isFetchingNextPage && <Spinner />}
      </div>
    </div>
  );
};

export const TvByDiscover = memo(TvByDiscoverComponent);
