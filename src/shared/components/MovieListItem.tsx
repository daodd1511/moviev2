import { memo } from 'react';

import { Movie } from '../../core/models';

interface Props {

  /** Movie data. */
  readonly movie: Movie;
}

const MovieListItemComponent = ({ movie }: Props) => (
  <div>
    {movie.title}
  </div>
);

export const MovieListItem = memo(MovieListItemComponent);
