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

const getTrailerKey = (videos: readonly Video[]) => {
  const trailer = videos.find(video => video.type === 'Trailer');
  return trailer != null ? trailer.key : '';
};

interface Props {

  /** Movie detail. */
  readonly movie: MovieDetail;

  /** Credits containing cast and crew. */
  readonly credits?: Credits;
}

const ContentComponent = ({ movie, credits }: Props) => {
  const [isWatchTrailer, setIsWatchTrailer] = useState(false);

  const trailerKey = getTrailerKey(movie.videos);

  const director = useMemo(
    () => credits?.crew?.find(({ job }) => job === 'Director'),
    [credits],
  );

  const runtime = toHoursAndMinutes(movie.runtime);
  const year = formatToYear(movie.releaseDate);

  return (
    <div className="relative z-2 max-w-4xl flex-1 pb-3.5">
      <p className="mb-4 text-[0.82rem] font-medium uppercase tracking-[0.2em] text-primary">
        Now Showing
      </p>
      <h1 id="movie-title" className="mb-2.5 text-[clamp(2.6rem,6vw,5rem)] font-extralight uppercase leading-[1.02] tracking-[0.015em] text-foreground">
        {movie.title}
      </h1>
      {movie.tagline !== '' && (
        <p className="mb-5 italic text-muted-foreground">{movie.tagline}</p>
      )}
      <p className="mb-7 flex flex-wrap items-center gap-4 text-muted-foreground">
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
        <ul className="mb-8 flex flex-wrap gap-3">
          {movie.genres.map(({ id, name }) => (
            <li key={id}>
              <Chip>{name}</Chip>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-4">
        {trailerKey !== '' && (
          <Button
            size="lg"
            className="h-12 rounded-full px-6 shadow-[0_10px_26px_-8px_rgba(245,165,36,0.55)]"
            onClick={() => setIsWatchTrailer(true)}
          >
            <Play className="h-4 w-4" /> Watch Trailer
          </Button>
        )}
        <Menu
          media={MediaMapper.fromMovie(movie)}
          triggerLabel="Add to list"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-foreground transition-colors hover:border-white/40 hover:bg-white/[0.16]"
          trigger={<ListIcon className="h-4 w-4" />}
        />
      </div>

      {trailerKey !== '' && (
        <TrailerDialog
          open={isWatchTrailer}
          onOpenChange={setIsWatchTrailer}
          title={movie.title}
          trailerKey={trailerKey}
        />
      )}
    </div>
  );
};

export const Content = memo(ContentComponent);
