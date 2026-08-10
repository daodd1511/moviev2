import { useParams, useSearchParams } from 'react-router-dom';

import { DiscoverTabs } from '../DiscoverTabs';
import { MediaList } from '../List/MediaList';
import { Loader } from '../styles/Loader';
import { CatalogFilters } from '../Filter/CatalogFilters';

import { Button } from '@/components/ui/button';
import { MOVIE_DISCOVER, TV_DISCOVER } from '@/shared/constants';
import { useInfiniteScroll } from '@/shared/hooks';
import { CatalogQueries } from '@/stores/queries/catalogQueries';
import type { CatalogMedia, CatalogMediaType } from '@/models/catalog-query.model';
import { Media } from '@/models/media.model';
import { MediaType } from '@/shared/enums/mediaType';

/** Per-media-type copy and routing. Everything else about the two catalogs is identical. */
const CATALOG = {
  movie: {
    kicker: 'Movies',
    noun: 'Movies',
    basePath: '/movie/discover',
    tabsLabel: 'Movie categories',
    categories: MOVIE_DISCOVER,
    mediaType: MediaType.Movie,
  },
  tv: {
    kicker: 'TV Shows',
    noun: 'TV Shows',
    basePath: '/tv/discover',
    tabsLabel: 'TV categories',
    categories: TV_DISCOVER,
    mediaType: MediaType.Tv,
  },
} as const satisfies Record<CatalogMediaType, unknown>;

/** The category slug that turns the page into filter-driven Discover mode. */
const DISCOVER_CATEGORY = 'discover';

const toMedia = (results: readonly { readonly mediaType: string }[], type: MediaType) =>
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
          type,
        }),
    );

const toNumber = (value: string | null): number | undefined =>
  value === null || value === '' ? undefined : Number(value);

/**
 * The catalog page for both movies and TV: hero header, category rail, optional
 * filters, and an infinite-scrolling results grid.
 *
 * The header, rail, and filters stay mounted across every category and filter change —
 * only the results region swaps to a loader. Short-circuiting the whole render on
 * `isPending` used to blank the page and cost the user the controls they had just
 * touched.
 *
 * @param mediaType Which catalog to render; selects copy, routes, and category list.
 */
export const CatalogByDiscover = ({ mediaType }: { readonly mediaType: CatalogMediaType }) => {
  const { discover } = useParams();
  const [params] = useSearchParams();
  const config = CATALOG[mediaType];

  const activeCategory = discover ?? 'popular';
  const isDiscoverMode = discover === DISCOVER_CATEGORY;
  const title = config.categories.find(item => item.value === discover)?.name ?? 'Discover';

  const isMovie = mediaType === 'movie';
  const dateGteKey = isMovie ? 'primary_release_date.gte' : 'first_air_date.gte';
  const dateLteKey = isMovie ? 'primary_release_date.lte' : 'first_air_date.lte';

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
    mediaType,
    category: isDiscoverMode ? undefined : activeCategory,
    sort_by: isDiscoverMode ? (params.get('sort') ?? undefined) : undefined,
    with_genres: isDiscoverMode ? (params.get('genres') ?? undefined) : undefined,
    'vote_average.gte': isDiscoverMode ? toNumber(params.get('vote_average.gte')) : undefined,
    [dateGteKey]: isDiscoverMode ? (params.get(dateGteKey) ?? undefined) : undefined,
    [dateLteKey]: isDiscoverMode ? (params.get(dateLteKey) ?? undefined) : undefined,
  });

  const { observerElement } = useInfiniteScroll(
    { root: null, rootMargin: '0px', threshold: 0.5 },
    () => void fetchNextPage(),
    hasNextPage,
  );

  const items =
    data === undefined
      ? []
      : toMedia(
          data.pages.flatMap(page => page.results),
          config.mediaType,
        );

  const renderResults = () => {
    if (isPending) {
      return <Loader className="min-h-[40vh]" />;
    }

    if (isError) {
      return (
        <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4">
          <p role="alert" className="text-sm text-destructive">
            Could not load this catalog: {error.message}
          </p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <p className="mt-8 rounded-xl border border-dashed border-foreground/15 py-16 text-center text-sm text-muted-foreground">
          Nothing matches these filters yet.
        </p>
      );
    }

    return (
      <div className="mt-8">
        <MediaList data={items} />
      </div>
    );
  };

  return (
    <main className="page-shell">
      <header className="border-b border-foreground/10 pb-6">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {config.kicker}
        </p>
        <h1 className="mt-2 text-3xl leading-tight font-light tracking-tight md:text-4xl">
          {title} {config.noun}
        </h1>
      </header>

      <div className="mt-6">
        <DiscoverTabs
          label={config.tabsLabel}
          basePath={config.basePath}
          activeValue={activeCategory}
          options={config.categories}
        />
      </div>

      {isDiscoverMode && <CatalogFilters mediaType={mediaType} />}

      {renderResults()}

      <div ref={observerElement}>{hasNextPage === true && isFetchingNextPage && <Loader />}</div>
    </main>
  );
};
