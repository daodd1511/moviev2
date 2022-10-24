import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Pagination, Tv } from '../../../core/models';
import { Spinner, TvList } from '../../../shared/components';
import { useInfiniteScroll } from '../../../shared/hooks/useInfiniteScroll';
import { TvService } from '../../../api/services/tvService';

const TvByGenreComponent = () => {
  const params = useParams();
  const genreId = parseInt(params.genreId ?? '', 10);
  const { data: genres } = useQuery(['genres'], () =>
    TvService.getGenres());
  const title = genres?.find(genre => genre.id === genreId)?.name ?? 'Genre';
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<Pagination<Tv>, AxiosError>(
    ['tvsByGenre', genreId],
    ({ pageParam = 1 }) => TvService.getTvsByGenre(genreId, pageParam),
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
    isFetchingNextPage,
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

export const TvByGenre = memo(TvByGenreComponent);
