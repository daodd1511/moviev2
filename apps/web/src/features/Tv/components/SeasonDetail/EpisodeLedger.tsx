import { memo } from 'react';
import { Star } from 'lucide-react';

import { Episode } from '@/models';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { BackdropSizes } from '@/shared/enums';
import { formatMediumDate } from '@/shared/utils';

interface Props {
  /** Episodes to render in their TMDB sequence. */
  readonly episodes: readonly Episode[];
}

const getStillUrl = (episode: Episode): string =>
  episode.stillPath !== null
    ? `${IMAGE_BASE_URL}${BackdropSizes.medium}${episode.stillPath}`
    : '/images/no-image.png';

const getEpisodeMeta = (episode: Episode): string => {
  const airDate = episode.airDate === null ? 'Not yet aired' : formatMediumDate(episode.airDate);
  return episode.runtime === null ? airDate : `${airDate} · ${episode.runtime} min`;
};

const EpisodeLedgerComponent = ({ episodes }: Props) => {
  if (episodes.length === 0) {
    return (
      <section className="rounded-md border border-border bg-surface/45 px-5 py-12 text-center">
        <h2 className="text-lg font-normal">No episodes yet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This season does not have any episode information yet.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="episode-ledger-title">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2
          id="episode-ledger-title"
          className="text-kicker font-medium tracking-[0.2em] text-muted-foreground uppercase"
        >
          Episode ledger
        </h2>
        <span className="hidden text-xs text-muted-foreground min-[590px]:inline">
          Fast scanning and comparison
        </span>
      </div>
      <div
        aria-hidden="true"
        className="hidden min-h-11 grid-cols-[3rem_9rem_minmax(12rem,1fr)_7.5rem_5rem] items-center gap-5 border-b border-border px-4 text-micro font-medium tracking-[0.15em] text-muted-foreground uppercase min-[860px]:grid"
      >
        <span>No.</span>
        <span>Still</span>
        <span>Episode</span>
        <span>Aired</span>
        <span className="text-right">Rating</span>
      </div>
      <ol>
        {episodes.map(episode => (
          <li
            key={episode.id}
            id={`episode-${episode.episodeNumber}`}
            className="grid min-h-28 grid-cols-[2rem_7.5rem_minmax(0,1fr)] items-start gap-x-3 border-b border-border px-0 py-3 transition-colors duration-200 hover:bg-foreground/[0.045] min-[590px]:grid-cols-[2rem_9rem_minmax(0,1fr)_4.5rem] min-[590px]:gap-x-4 min-[860px]:min-h-32 min-[860px]:grid-cols-[3rem_9rem_minmax(12rem,1fr)_7.5rem_5rem] min-[860px]:items-center min-[860px]:gap-5 min-[860px]:px-4"
          >
            <span className="pt-1 text-xl font-extralight text-muted-foreground/70 tabular-nums min-[860px]:pt-0">
              {episode.episodeNumber}
            </span>
            <img
              src={getStillUrl(episode)}
              alt={`${episode.name} still`}
              loading="lazy"
              className="aspect-video w-full rounded-md object-cover outline outline-1 outline-foreground/12"
            />
            <div className="col-start-3 row-start-1 min-w-0 pr-14 min-[590px]:pr-0">
              <p className="mt-0.5 text-micro font-medium tracking-[0.16em] text-muted-foreground uppercase min-[860px]:hidden">
                Episode {episode.episodeNumber}
              </p>
              <h3 className="mt-1 text-base leading-snug font-normal text-foreground">
                {episode.name}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-compact leading-relaxed text-muted-foreground">
                {episode.overview === '' ? 'No episode overview available.' : episode.overview}
              </p>
              <p className="mt-2 text-xs text-muted-foreground min-[860px]:hidden">
                {getEpisodeMeta(episode)}
              </p>
            </div>
            <p className="col-start-3 row-start-1 justify-self-end pt-0.5 text-sm font-medium text-primary min-[590px]:col-start-4 min-[860px]:col-start-5 min-[860px]:pt-0">
              {episode.voteAverage === null ? (
                'Not rated'
              ) : (
                <span
                  className="inline-flex items-center gap-1"
                  aria-label={`${episode.voteAverage.toFixed(1)} rating`}
                >
                  <Star aria-hidden="true" className="size-3.5 fill-current" />
                  {episode.voteAverage.toFixed(1)}
                </span>
              )}
            </p>
            <p className="col-start-4 row-start-1 hidden text-xs text-muted-foreground min-[860px]:block">
              {episode.airDate === null ? 'Not yet aired' : formatMediumDate(episode.airDate)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
};

export const EpisodeLedger = memo(EpisodeLedgerComponent);
