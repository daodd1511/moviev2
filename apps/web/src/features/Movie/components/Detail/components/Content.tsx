import { memo, useMemo, useState } from 'react';
import { List as ListIcon, Play, Star } from 'lucide-react';

import { MovieDetail, Credits, Video } from '@/models';
import { formatToYear } from '@/shared/utils';
import { Menu } from '@/shared/components/List/Menu';
import { MediaMapper } from '@/api/mappers/media.mapper';
import { Button } from '@/components/ui/button';
import { Chip } from '@/shared/components/ui/Chip';
import { TrailerDialog } from '@/shared/components/ui/TrailerDialog';

const toHoursAndMinutes = (minutes: number | null): string => {
  if (minutes === null) {
    return '';
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

const getTrailers = (videos: readonly Video[]): readonly Video[] =>
  videos
    .filter(video => video.type === 'Trailer' && video.site === 'YouTube')
    .sort((a, b) => {
      const officialComparison = Number(b.official) - Number(a.official);
      return officialComparison !== 0
        ? officialComparison
        : b.publishedAt.localeCompare(a.publishedAt);
    });

interface Props {
  /** Movie detail. */
  readonly movie: MovieDetail;

  /** Credits containing cast and crew. */
  readonly credits?: Credits;
}

const ContentComponent = ({ movie, credits }: Props) => {
  const [isWatchTrailer, setIsWatchTrailer] = useState(false);

  const trailers = getTrailers(movie.videos);

  const director = useMemo(() => credits?.crew?.find(({ job }) => job === 'Director'), [credits]);

  const runtime = toHoursAndMinutes(movie.runtime);
  const year = formatToYear(movie.releaseDate);

  return (
    <div className="relative z-2 w-full max-w-4xl flex-1 pb-3.5 text-center md:text-left">
      <p className="mb-3 text-[0.72rem] font-medium tracking-[0.2em] text-primary uppercase md:mb-4 md:text-[0.82rem]">
        Now Showing
      </p>
      <h1
        id="movie-title"
        className="mb-2.5 text-[clamp(2.15rem,11vw,5rem)] leading-[1.02] font-extralight tracking-[0.015em] text-foreground md:uppercase"
      >
        {movie.title}
      </h1>
      {movie.tagline !== '' && <p className="mb-5 text-muted-foreground italic">{movie.tagline}</p>}
      <p className="mb-5 flex flex-wrap items-center justify-center gap-2.5 text-sm text-muted-foreground md:mb-7 md:justify-start md:gap-4 md:text-base">
        <span className="inline-flex items-center gap-1.5 font-medium text-primary">
          <Star className="h-4 w-4 fill-current" />
          {movie.voteAverage.toFixed(1)}
        </span>
        {runtime !== '' && (
          <>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-border" />
            <span>{runtime}</span>
          </>
        )}
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-border" />
        <span>{year}</span>
        {director != null && (
          <>
            <span aria-hidden="true" className="h-1 w-1 rounded-full bg-border" />
            <span>{director.name}</span>
          </>
        )}
      </p>

      {movie.genres.length > 0 && (
        <ul className="mb-6 flex flex-wrap justify-center gap-2 md:mb-8 md:justify-start md:gap-3">
          {movie.genres.map(({ id, name }) => (
            <li key={id}>
              <Chip>{name}</Chip>
            </li>
          ))}
        </ul>
      )}

      <div className="mx-auto flex w-full max-w-md items-center justify-center gap-3 sm:w-auto sm:gap-4 md:mx-0 md:justify-start">
        {trailers.length > 0 && (
          <Button
            size="lg"
            className="h-12 flex-1 rounded-full px-6 shadow-[0_10px_26px_-8px_rgba(245,165,36,0.55)] sm:flex-none"
            onClick={() => setIsWatchTrailer(true)}
          >
            <Play className="h-4 w-4" />
            {trailers.length > 1 ? `Trailers · ${trailers.length}` : 'Watch Trailer'}
          </Button>
        )}
        <Menu
          media={MediaMapper.fromMovie(movie)}
          triggerLabel="Add to list"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-foreground transition-colors hover:border-white/40 hover:bg-white/[0.16]"
          trigger={<ListIcon className="h-4 w-4" />}
        />
      </div>

      {trailers.length > 0 && (
        <TrailerDialog
          open={isWatchTrailer}
          onOpenChange={setIsWatchTrailer}
          title={movie.title}
          trailers={trailers}
        />
      )}
    </div>
  );
};

export const Content = memo(ContentComponent);
