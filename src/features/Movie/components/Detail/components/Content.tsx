import { memo, useMemo, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';

import { Buttons } from './Buttons';

import { MovieDetail, Credits } from '@/models';
import { formatToYear } from '@/shared/utils';
import { Menu } from '@/shared/components/List/Menu';
import { MediaMapper } from '@/api/mappers/media.mapper';

// Utility for formatting runtime
const toHoursAndMinutes = (minutes: number | null): string => {
  if (minutes === null) {
    return '';
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

interface Props {

  /** Movie detail. */
  readonly movie: MovieDetail;

  /** Credits containing cast and crew. */
  readonly credits?: Credits;
}

const ContentComponent = ({ movie, credits }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

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
        <div className="relative pt-4">
          <button
            type="button"
            aria-label="Toggle movie menu"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cPrimary text-white transition hover:bg-cPrimary/90"
            onClick={toggleMenu}
          >
            <FontAwesomeIcon icon={faList} />
          </button>
          <Menu
            media={MediaMapper.fromMovie(movie)}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            className="shadow-xl"
          />
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

      {/* Buttons */}
      <Buttons movie={movie} />
    </div>
  );
};

export const Content = memo(ContentComponent);
