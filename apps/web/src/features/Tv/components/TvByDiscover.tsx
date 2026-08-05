import { memo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
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
      <main className="page-shell">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4">
          <p role="alert" className="text-sm text-destructive">
            Could not load this catalog: {error.message}
          </p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </main>
    );
  }
  const items = toMedia(data.pages.flatMap(page => page.results));

  return (
    <main className="page-shell">
      <header className="border-b border-foreground/10 pb-6">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          TV Shows
        </p>
        <h1 className="mt-2 text-3xl leading-tight font-light tracking-tight md:text-4xl">
          {title} TV Shows
        </h1>
      </header>

      <div className="mt-6">
        <DiscoverTabs
          label="TV categories"
          basePath="/tv/discover"
          activeValue={discover ?? 'popular'}
          options={TV_DISCOVER}
        />
      </div>

      {isDiscoverMode && <CatalogFilters mediaType="tv" />}

      {items.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-foreground/15 py-16 text-center text-sm text-muted-foreground">
          Nothing matches these filters yet.
        </p>
      ) : (
        <div className="mt-8">
          <MediaList data={items} />
        </div>
      )}

      <div ref={observerElement}>{hasNextPage === true && isFetchingNextPage && <Loader />}</div>
    </main>
  );
};

export const TvByDiscover = memo(TvByDiscoverComponent);
