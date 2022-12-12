import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';

import { Buttons } from './Buttons';

import { Genre, MovieDetail } from '@/models';
import { formatToYear } from '@/shared/utils';
import { Menu } from '@/shared/components/List/Menu';

interface Props {

  /** Movie detail. */
  readonly movie: MovieDetail;
}

const ContentComponent = ({ movie }: Props) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const onListMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const onGenreClick = (genre: Genre) => {
    navigate(`/movie/genre/${genre.id}`);
  };
  return (
    <>
      <div className="pb-8">
        <h1 className="mb-2 text-5xl font-extralight text-slate-700">
          {movie.title.toUpperCase()}
        </h1>
        <h2 className="mb-2 text-lg font-bold text-slate-700">
          {movie.tagline.toUpperCase()}
        </h2>
        <h3 className="text-slate-400">
          {movie.voteAverage.toFixed(1)} / {movie.runtime} min /{' '}
          {formatToYear(movie.releaseDate)}
        </h3>
        <div className="relative pt-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cPrimary text-sm text-white"
            onClick={onListMenuClick}
          >
            <FontAwesomeIcon icon={faList} />
          </button>
          <Menu
            media={movie}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            className="shadow-xl"
          />
        </div>
      </div>
      <div className="pb-8">
        <h3 className="mb-2 text-lg font-medium">Genres</h3>
        <ul className="flex gap-2">
          {movie.genres.map(genre => (
            <li
              key={genre.id}
              className="align-center ease flex w-max cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-500 transition duration-300 active:bg-gray-300"
              onClick={() => onGenreClick(genre)}
            >
              {genre.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="pb-8">
        <h3 className="mb-2 text-lg font-medium">Overview</h3>
        <p className="font-light">{movie.overview}</p>
      </div>
      <Buttons movie={movie} />
    </>
  );
};

export const Content = memo(ContentComponent);
