import { memo } from 'react';

import { TvDetail } from '@/models';
import { Kicker } from '@/shared/components/ui/Kicker';
import { FactList } from '@/shared/components/ui/FactList';
import { formatDate } from '@/shared/utils';

interface Props {

  /** Tv detail. */
  readonly tv: TvDetail;
}

const OverviewComponent = ({ tv }: Props) => {
  const facts = [
    { key: 'firstAir', label: 'First air date', value: formatDate(tv.firstAirDate) },
    { key: 'seasons', label: 'Seasons', value: tv.seasons.length },
    { key: 'language', label: 'Original language', value: tv.originalLanguage.toUpperCase() },
  ];

  return (
    <div className="grid gap-10 pt-10 md:grid-cols-[1.8fr_1fr] md:gap-16 md:pt-14">
      <section aria-labelledby="overview-heading">
        <Kicker id="overview-heading">Overview</Kicker>
        <p className="max-w-[65ch] text-base leading-[1.75] text-foreground md:text-[1.08rem] md:leading-[1.8]">
          {tv.overview}
        </p>
      </section>
      <section aria-labelledby="details-heading">
        <Kicker id="details-heading">Details</Kicker>
        <FactList facts={facts} />
      </section>
    </div>
  );
};

export const Overview = memo(OverviewComponent);
