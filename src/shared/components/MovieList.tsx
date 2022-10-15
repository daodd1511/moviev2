import { memo } from 'react';

import { Movie } from '../../core/models';

interface Props {

  /** Discover type. */
  readonly movies: readonly Movie[];

  /** Title. */
  readonly title: string;
}

const MovieListComponent = ({ movies, title }: Props) => (
  <div>
    <h1 className="text-2xl text-red-500">{title}</h1>
    <div>
      {movies.map(movie => <div key={movie.id}>
        {movie.title}
      </div>)}
    </div>
  </div>
);

export const MovieList = memo(MovieListComponent);
