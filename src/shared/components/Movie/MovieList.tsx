import { memo } from 'react';

import { Movie } from '../../../core/models';

import { MovieListItem } from './MovieListItem';

interface Props {

  /** Movies data. */
  readonly movies: readonly Movie[];
}

const MovieListComponent = ({ movies }: Props) => (
  <div className="grid grid-cols-autoFit gap-x-6 gap-y-10 place-content-evenly pb-10">
    {movies.map(movie =>
      <MovieListItem movie={movie} key={movie.id}/>)}
  </div>
);

export const MovieList = memo(MovieListComponent);
