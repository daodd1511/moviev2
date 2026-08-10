import { memo, useEffect } from 'react';

import { EpisodeLedger } from './EpisodeLedger';
import { SeasonHero } from './SeasonHero';

import { Button } from '@/components/ui/button';
import { Footer, Loader } from '@/shared/components';
import { TvQueries } from '@/stores/queries/tvQueries';
import { goToTop } from '@/shared/utils';

interface Props {
  /** TV identifier from the validated route. */
  readonly tvId: number;

  /** Season number from the validated route. */
  readonly seasonNumber: number;
}

const SeasonDetailComponent = ({ tvId, seasonNumber }: Props) => {
  const tvQuery = TvQueries.useDetail(tvId);
  const seasonQuery = TvQueries.useSeasonDetail(tvId, seasonNumber);

  useEffect(() => {
    goToTop();
  }, [seasonNumber, tvId]);

  const handleRetry = (): void => {
    if (tvQuery.isError || tvQuery.data === undefined) {
      void tvQuery.refetch();
    }

    if (seasonQuery.isError || seasonQuery.data === undefined) {
      void seasonQuery.refetch();
    }
  };

  if (tvQuery.isPending || seasonQuery.isPending) {
    return <Loader className="min-h-[60vh]" />;
  }

  if (
    tvQuery.isError ||
    seasonQuery.isError ||
    tvQuery.data === undefined ||
    seasonQuery.data === undefined
  ) {
    return (
      <main className="page-shell flex min-h-[60vh] flex-col items-center justify-center text-center">
        <p className="text-micro font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Season unavailable
        </p>
        <h1 className="mt-3 text-3xl font-extralight">Couldn&apos;t load this season</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Check your connection and try again. The rest of the show is unchanged.
        </p>
        <Button type="button" className="mt-6" onClick={handleRetry}>
          Try again
        </Button>
      </main>
    );
  }

  return (
    <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_86%_18%,rgba(19,78,91,0.14),transparent_26rem)]">
      <SeasonHero tv={tvQuery.data} season={seasonQuery.data} />
      <main className="relative page-shell pt-14 pb-8 min-[860px]:pt-18 min-[860px]:pb-12">
        <EpisodeLedger episodes={seasonQuery.data.episodes} />
      </main>
      <Footer />
    </div>
  );
};

export const SeasonDetail = memo(SeasonDetailComponent);
