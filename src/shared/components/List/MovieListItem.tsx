import { memo, useState } from 'react';
import { Link } from 'react-router-dom';

import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { IMAGE_BASE_URL } from '../../constants';
import { PosterSizes } from '../../enums';
import { formatToYear } from '../../utils';

import { Menu } from './Menu';

import { Movie } from '@/models';

interface Props {

  /** Movie data. */
  readonly movie: Movie;
}

const MovieListItemComponent = ({ movie }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const onItemMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const imageURL =
    movie.posterPath != null ?
      `${IMAGE_BASE_URL}${PosterSizes.large}${movie.posterPath}` :
      '/images/no-image.png';

  return (
    <div className="relative">
      <Link
        to={`/movie/detail/${movie.id}`}
        className="group block h-fit pb-4 transition-all hover:text-white"
      >
        <img
          src={imageURL}
          alt={`${movie.title} image`}
          className="rounded-lg shadow-2xl group-hover:rounded-bl-none group-hover:rounded-br-none"
        />
        <div className="pb-4  group-hover:rounded-b-lg group-hover:bg-slate-700">
          <p className="text-md p-2 pb-4 text-center">{movie.title}</p>
          <div className="flex justify-evenly">
            <div className="flex items-center rounded-lg border border-gray-300 px-2 py-1 text-center text-sm">
              {formatToYear(movie.releaseDate)}
            </div>
            <div className="ml-2 rounded-lg border border-gray-300 p-2 text-center text-sm">
              {movie.voteAverage.toFixed(1)}
            </div>
          </div>
        </div>
      </Link>
      <button
        type="button"
        className="absolute top-2 right-2  flex h-5 w-5 items-center justify-center rounded-full bg-slate-500"
        onClick={onItemMenuClick}
      >
        <FontAwesomeIcon icon={faEllipsis} className="text-white" />
      </button>
      <Menu media={movie} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} className="top-2 right-2"/>
    </div>
  );
};

export const MovieListItem = memo(MovieListItemComponent);
