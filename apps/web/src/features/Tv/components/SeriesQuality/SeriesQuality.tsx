import { useEffect, useState } from 'react';

import { EpisodeInspector } from './EpisodeInspector';
import { EpisodeMatrix, EpisodeSelection, QualitySeasonColumn } from './EpisodeMatrix';
import { QualityHero } from './QualityHero';
import { QualityLegend } from './QualityLegend';

import { buildEpisodeMatrix, calculateEpisodeAverage } from '../../utils/seriesQuality';

import { Button } from '@/components/ui/button';
import { Footer, Loader } from '@/shared/components';
import { Season } from '@/models';
import { goToTop } from '@/shared/utils';
import { TvQueries } from '@/stores/queries/tvQueries';

interface Props {
  /** Validated TV identifier from the route boundary. */
  readonly tvId: number;
}

const toColumn = (
  season: Season,
  query: ReturnType<typeof TvQueries.useSeasonDetails>[number] | undefined,
): QualitySeasonColumn => {
  if (query === undefined || query.isPending) {
    return { kind: 'loading', season };
  }

  if (query.isError || query.data === undefined) {
    return {
      kind: 'error',
      retry: () => {
        void query.refetch();
      },
      season,
    };
  }

  return { detail: query.data, kind: 'loaded', season };
};

/** Coordinates TV detail and independently retryable season queries for the quality page. */
export const SeriesQuality = ({ tvId }: Props) => {
  const [showSpecials, setShowSpecials] = useState(false);
  const [selection, setSelection] = useState<EpisodeSelection | null>(null);
  const tvQuery = TvQueries.useDetail(tvId);
  const regularSeasons = tvQuery.data?.seasons.filter(season => season.seasonNumber > 0) ?? [];
  const specials = tvQuery.data?.seasons.find(season => season.seasonNumber === 0);
  const regularQueries = TvQueries.useSeasonDetails(
    tvId,
    regularSeasons.map(season => season.seasonNumber),
  );
  const specialsQueries = TvQueries.useSeasonDetails(
    tvId,
    showSpecials && specials !== undefined ? [0] : [],
  );

  useEffect(() => {
    goToTop();
  }, [tvId]);

  const handleShowSpecialsChange = (checked: boolean): void => {
    setShowSpecials(checked);
    if (!checked && selection?.season.seasonNumber === 0) {
      setSelection(null);
    }
  };

  const handleFullRetry = (): void => {
    if (tvQuery.isError || tvQuery.data === undefined) {
      void tvQuery.refetch();
      return;
    }

    regularQueries.forEach(query => {
      void query.refetch();
    });
  };

  if (tvQuery.isPending || tvQuery.data === undefined) {
    if (tvQuery.isError) {
      return (
        <main className="page-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
          <p className="text-micro font-medium tracking-[0.2em] text-muted-foreground uppercase">
            Series unavailable
          </p>
          <h1 className="mt-3 text-3xl font-extralight">Couldn&apos;t load Series quality</h1>
          <Button type="button" className="mt-6" onClick={handleFullRetry}>
            Try again
          </Button>
        </main>
      );
    }

    return <Loader className="min-h-[60vh]" />;
  }

  const regularPending = regularQueries.some(query => query.isPending);
  if (regularPending) {
    return <Loader className="min-h-[60vh]" />;
  }

  const allRegularFailed =
    regularQueries.length > 0 &&
    regularQueries.every(query => query.isError || query.data === undefined);
  if (allRegularFailed) {
    return (
      <main className="page-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-micro font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Seasons unavailable
        </p>
        <h1 className="mt-3 text-3xl font-extralight">Couldn&apos;t load Series quality</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Every numbered season failed to load. Try the complete comparison again.
        </p>
        <Button type="button" className="mt-6" onClick={handleFullRetry}>
          Try again
        </Button>
      </main>
    );
  }

  const regularColumns = regularSeasons.map((season, index) =>
    toColumn(season, regularQueries[index]),
  );
  const specialColumn =
    showSpecials && specials !== undefined ? toColumn(specials, specialsQueries[0]) : undefined;
  const columns = specialColumn === undefined ? regularColumns : [specialColumn, ...regularColumns];
  const loadedColumns = columns.filter(
    (column): column is Extract<QualitySeasonColumn, { readonly kind: 'loaded' }> =>
      column.kind === 'loaded',
  );
  const loadedSeasons = loadedColumns.map(column => column.detail);
  const rows = buildEpisodeMatrix(loadedSeasons);
  const episodeAverage = calculateEpisodeAverage(loadedSeasons);
  const episodeCount = loadedSeasons.reduce((count, season) => count + season.episodes.length, 0);
  const visibleSelection =
    selection !== null &&
    loadedColumns.some(column => column.season.seasonNumber === selection.season.seasonNumber)
      ? selection
      : null;

  return (
    <div>
      <QualityHero
        tv={tvQuery.data}
        episodeAverage={episodeAverage}
        episodeCount={episodeCount}
        hasSpecials={specials !== undefined}
        showSpecials={showSpecials}
        onShowSpecialsChange={handleShowSpecialsChange}
      />
      <main className="page-shell py-12 min-[860px]:py-14">
        <header className="mb-8 flex flex-col items-start justify-between gap-5 min-[860px]:flex-row min-[860px]:items-end">
          <div className="max-w-2xl">
            <p className="text-micro font-medium tracking-[0.2em] text-primary uppercase">
              Episode matrix
            </p>
            <h2 className="mt-2 text-3xl font-light tracking-tight">Every episode, one glance</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Seasons run across the columns. Episode positions run down the rows; color and value
              reveal the show&apos;s quality at a glance.
            </p>
          </div>
          <QualityLegend />
        </header>
        <section
          className="grid overflow-hidden rounded-md border border-foreground/12 bg-surface/70 shadow-[0_26px_58px_-32px_rgba(0,0,0,0.84)] min-[860px]:grid-cols-[minmax(0,1fr)_18rem]"
          aria-label="Series episode quality"
        >
          <EpisodeMatrix
            columns={columns}
            rows={rows}
            selection={visibleSelection}
            onSelect={setSelection}
          />
          <EpisodeInspector selection={visibleSelection} tvId={tvId} />
        </section>
      </main>
      <Footer />
    </div>
  );
};
