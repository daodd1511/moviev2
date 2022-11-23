import { memo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { Loader, TvList } from '@/shared/components';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { TvService } from '@/api/services/tvService';
import { TvQueries } from '@/stores/queries/tvQueries';

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
  } = TvQueries.useInfiniteListByGenre(genreId);

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
      <h1 className="pb-10 text-2xl font-medium">{title}</h1>
      {data.pages.map((tvPage, i) => (
        <TvList key={i} tvs={tvPage.results} />
      ))}
      <div className="loader" ref={observerElement}>
        {hasNextPage !== undefined && isFetchingNextPage && <Loader />}
      </div>
    </div>
  );
};

export const TvByGenre = memo(TvByGenreComponent);
