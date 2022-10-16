import { memo } from 'react';

import { Movie } from '../../core/models';

import { MovieListItem } from './MovieListItem';

interface Props {

  /** Movies data. */
  readonly movies: readonly Movie[];
}

const MovieListComponent = ({ movies }: Props) => (
  <div>
    {movies.map(movie => <MovieListItem key={movie.id} movie={movie} />)}
  </div>
);

export const MovieList = memo(MovieListComponent);
