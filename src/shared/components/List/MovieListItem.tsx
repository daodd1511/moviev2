import { memo } from 'react';

import { Link } from 'react-router-dom';

import { IMAGE_BASE_URL } from '../../constants';
import { PosterSizes } from '../../enums';
import { formatToYear } from '../../utils';

import { Movie } from '@/models';

interface Props {

  /** Movie data. */
  readonly movie: Movie;
}

const MovieListItemComponent = ({ movie }: Props) => {
  const imageURL =
    movie.posterPath != null ?
      `${IMAGE_BASE_URL}${PosterSizes.large}${movie.posterPath}` :
      '/images/no-image.png';
  return (
    <Link to={`/movie/detail/${movie.id}`} className="h-fit hover:scale-105 transition-all pb-4 hover:bg-slate-700 hover:text-white hover:rounded-lg block group">
      <img src={imageURL} alt={`${movie.title} image`} className="rounded-lg group-hover:rounded-bl-none group-hover:rounded-br-none shadow-2xl" />
      <p className="text-md p-2 pb-4 text-center">{movie.title}</p>
      <div className="flex justify-evenly">
        <div className="flex items-center text-center text-sm px-2 py-1 border border-gray-300 rounded-lg">{formatToYear(movie.releaseDate)}</div>
        <div className="text-center text-sm ml-2 p-2 border border-gray-300 rounded-lg">{movie.voteAverage.toFixed(1)}</div>
      </div>
    </Link>
  );
};

export const MovieListItem = memo(MovieListItemComponent);
