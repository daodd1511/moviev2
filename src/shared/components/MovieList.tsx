import { memo } from 'react';

import { Movie } from '../../core/models';

import { MovieListItem } from './MovieListItem';

interface Props {

  /** Movies data. */
  readonly movies: readonly Movie[];
}

const MovieListComponent = ({ movies }: Props) => (
  <div className="grid grid-cols-4 gap-x-6 gap-y-10">
    {movies.map(movie => <MovieListItem key={movie.id} movie={movie} />)}
  </div>
);

export const MovieList = memo(MovieListComponent);
