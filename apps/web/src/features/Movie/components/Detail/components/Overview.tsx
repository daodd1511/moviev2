import { memo, useMemo } from 'react';

import { MovieDetail, Credits } from '@/models';
import { Kicker } from '@/shared/components/ui/Kicker';
import { FactList } from '@/shared/components/ui/FactList';

interface Props {
  /** Movie detail. */
  readonly movie: MovieDetail;

  /** Credits containing cast and crew. */
  readonly credits?: Credits;
}

const OverviewComponent = ({ movie, credits }: Props) => {
  const director = useMemo(() => credits?.crew?.find(({ job }) => job === 'Director'), [credits]);

  const facts = [
    { key: 'director', label: 'Director', value: director?.name ?? '—' },
    {
      key: 'release',
      label: 'Release date',
      value: new Date(movie.releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    },
    {
      key: 'runtime',
      label: 'Runtime',
      value: movie.runtime !== null ? `${movie.runtime} min` : '—',
    },
    { key: 'language', label: 'Original language', value: movie.originalLanguage.toUpperCase() },
    { key: 'status', label: 'Status', value: movie.status },
  ];

  return (
    <div className="grid gap-10 pt-10 md:grid-cols-[1.8fr_1fr] md:gap-16 md:pt-14">
      <section aria-labelledby="overview-heading">
        <Kicker id="overview-heading">Overview</Kicker>
        <p className="max-w-[65ch] text-base leading-[1.75] text-foreground md:text-[1.08rem] md:leading-[1.8]">
          {movie.overview}
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
