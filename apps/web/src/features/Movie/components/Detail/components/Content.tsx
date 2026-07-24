/* eslint-disable max-lines-per-function */
import { memo, useMemo, useState } from 'react';
import { List as ListIcon, Play } from 'lucide-react';

import { MovieDetail, Credits, Video } from '@/models';
import { formatToYear } from '@/shared/utils';
import { Menu } from '@/shared/components/List/Menu';
import { MediaMapper } from '@/api/mappers/media.mapper';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

// Utility for formatting runtime
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

  // Memoize derived data
  const directors = useMemo(
    () => credits?.crew?.filter(({ job }) => job === 'Director') ?? [],
    [credits],
  );

  const movieInfoText = useMemo(() => {
    const rating = movie.voteAverage.toFixed(1);
    const runtime = toHoursAndMinutes(movie.runtime);
    const year = formatToYear(movie.releaseDate);
    return `${rating} / ${runtime} / ${year}`;
  }, [movie.voteAverage, movie.runtime, movie.releaseDate]);

  return (
    <div className="pb-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="mb-2 text-5xl font-extralight text-slate-700">
          {movie.title.toUpperCase()}
        </h1>
        <h2 className="mb-2 text-lg font-bold text-slate-700">
          {movie.tagline.toUpperCase()}
        </h2>
        <p className="text-slate-400">{movieInfoText}</p>

        {/* Menu button */}
        <div className="flex gap-4 items-center pt-4">
          <Menu
            media={MediaMapper.fromMovie(movie)}
            triggerLabel="Toggle movie menu"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cPrimary text-white transition hover:bg-cPrimary/90"
            trigger={<ListIcon className="h-4 w-4" />}
          />
          <div>
            <button
              type="button"
              className="h-10 w-28 rounded-full border border-gray-800 text-xs transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:text-white"
              onClick={() => setIsWatchTrailer(true)}
            >
              Trailer <Play className="ml-1 inline h-3.5 w-3.5" />
            </button>
            {trailerKey !== '' && (
              <Dialog open={isWatchTrailer} onOpenChange={setIsWatchTrailer}>
                <DialogContent className="w-[80vw] max-w-7xl border-0 bg-transparent p-0 shadow-none ring-0">
                  <DialogTitle className="sr-only">{movie.title} trailer</DialogTitle>
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${trailerKey}`}
                      title="Trailer"
                      className="h-full w-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      {/* Genres */}
      {movie.genres.length > 0 && (
        <section className="pb-8">
          <h3 className="mb-2 text-lg font-medium">Genres</h3>
          <ul className="flex flex-wrap gap-2">
            {movie.genres.map(({ id, name }) => (
              <li
                key={id}
                className="cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-500 transition duration-200 hover:bg-gray-100 active:bg-gray-200"
              >
                {name}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Overview */}
      <section className="pb-8">
        <h3 className="mb-2 text-lg font-medium">Overview</h3>
        <p className="font-light leading-relaxed">{movie.overview}</p>
      </section>

      {/* Directors */}
      {directors.length > 0 && (
        <section className="pb-8">
          <h3 className="mb-2 text-lg font-medium">
            Director{directors.length > 1 ? 's' : ''}
          </h3>
          <ul className="space-y-2">
            {directors.map(director => {
              const otherRoles =
                credits?.crew
                  ?.filter(
                    crew => crew.id === director.id && crew.job !== 'Director',
                  )
                  .map(crew => crew.job) ?? [];

              return (
                <li key={director.id} className="flex flex-wrap items-center">
                  <span className="font-semibold">{director.name}</span>
                  {otherRoles.length > 0 && (
                    <span className="ml-2 text-gray-600">
                      ({otherRoles.join(', ')})
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
};

export const Content = memo(ContentComponent);
