import { memo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { DiscoverTabs, Loader, MediaList } from '@/shared/components';
import { TV_DISCOVER } from '@/shared/constants';
import { useInfiniteScroll } from '@/shared/hooks';
import { CatalogQueries } from '@/stores/queries/catalogQueries';
import type { CatalogMedia } from '@/models/catalog-query.model';
import { Media } from '@/models/media.model';
import { MediaType } from '@/shared/enums/mediaType';
import { CatalogFilters } from '@/shared/components/Filter/CatalogFilters';

const toMedia = (results: readonly { readonly mediaType: string }[]) =>
  results
    .filter((item): item is CatalogMedia => item.mediaType !== 'person')
    .map(
      item =>
        new Media({
          id: item.id,
          title: item.title,
          posterPath: item.posterPath,
          releaseDate: item.releaseDate,
          voteAverage: item.voteAverage,
          type: MediaType.Tv,
        }),
    );

const toNumber = (value: string | null): number | undefined =>
  value === null || value === '' ? undefined : Number(value);

const TvByDiscoverComponent = () => {
  const { discover } = useParams();
  const [params] = useSearchParams();
  const title = TV_DISCOVER.find(item => item.value === discover)?.name ?? 'Discover';
  const isDiscoverMode = discover === 'discover';
  const category = isDiscoverMode ? undefined : (discover ?? 'popular');

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
    error,
    refetch,
  } = CatalogQueries.useInfiniteDiscover({
    mediaType: 'tv',
    category,
    sort_by: isDiscoverMode ? (params.get('sort') ?? undefined) : undefined,
    with_genres: isDiscoverMode ? (params.get('genres') ?? undefined) : undefined,
    'vote_average.gte': isDiscoverMode ? toNumber(params.get('vote_average.gte')) : undefined,
    'first_air_date.gte': isDiscoverMode
      ? (params.get('first_air_date.gte') ?? undefined)
      : undefined,
    'first_air_date.lte': isDiscoverMode
      ? (params.get('first_air_date.lte') ?? undefined)
      : undefined,
  });

  const { observerElement } = useInfiniteScroll(
    { root: null, rootMargin: '0px', threshold: 0.5 },
    () => void fetchNextPage(),
    hasNextPage,
  );

  if (isPending) {
    return <Loader className="min-h-[60vh]" />;
  }

  if (isError) {
    return (
      <div>
        <p role="alert">Error: {error.message}</p>
        <button type="button" onClick={() => void refetch()}>
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="px-4 py-8 md:px-8 md:py-12">
      <h1 className="pb-6 text-2xl font-semibold md:pb-10">{title} TV Shows</h1>
      <DiscoverTabs
        label="TV categories"
        basePath="/tv/discover"
        activeValue={discover ?? 'popular'}
        options={TV_DISCOVER}
      />
      {isDiscoverMode && <CatalogFilters mediaType="tv" />}
      {data.pages.map((tvPage, index) => (
        <MediaList key={index} data={toMedia(tvPage.results)} />
      ))}
      <div ref={observerElement}>{hasNextPage === true && isFetchingNextPage && <Loader />}</div>
    </div>
  );
};

export const TvByDiscover = memo(TvByDiscoverComponent);
