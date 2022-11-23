import { memo } from 'react';

import { MovieListItem, TvListItem } from '..';

import { Movie, Tv } from '@/models';

interface Props {

  /** Film data. */
  readonly data: readonly Movie[] | readonly Tv[];
}

const FilmListComponent = ({ data }: Props) => (
  <div className="grid grid-cols-autoFit gap-x-6 gap-y-10 place-content-evenly pb-10">
    {data.map(item => {
        if (item instanceof Movie) {
            return <MovieListItem movie={item} key={item.id}/>;
        }
            return <TvListItem tv={item} key={item.id}/>;
        })
    }
  </div>
);

export const FilmList = memo(FilmListComponent);
