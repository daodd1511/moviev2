import { memo } from 'react';

import { Link } from 'react-router-dom';

import { IMAGE_BASE_URL } from '../../constants';
import { PosterSizes } from '../../enums';
import { formatToYear } from '../../utils';

import { Menu } from './Menu';

import { Tv } from '@/models/';
interface Props {

  /** Tv data. */
  readonly tv: Tv;
}

const TvListItemComponent = ({ tv }: Props) => {
  const imageURL =
    tv.posterPath != null ?
      `${IMAGE_BASE_URL}${PosterSizes.large}${tv.posterPath}` :
      '/images/no-image.png';

  return (
    <div className="relative">
      <Link
        to={`/tv/detail/${tv.id}`}
        className="group block h-fit transition-all hover:rounded-lg hover:text-white"
      >
        <img
          src={imageURL}
          alt={`${tv.name} image`}
          className="rounded-lg shadow-2xl group-hover:rounded-bl-none group-hover:rounded-br-none"
        />
        <div className="group-hover:bg-slate-700 group-hover:rounded-b-lg  pb-4">
          <p className="text-md p-2 pb-4 text-center">{tv.name}</p>
          <div className="flex justify-evenly">
            <div className="flex items-center rounded-lg border border-gray-300 px-2 py-1 text-center text-sm">
              {formatToYear(tv.firstAirDate)}
            </div>
            <div className="ml-2 rounded-lg border border-gray-300 p-2 text-center text-sm">
              {tv.voteAverage.toFixed(1)}
            </div>
          </div>
        </div>
      </Link>
      <Menu media={tv}/>
    </div>
  );
};

export const TvListItem = memo(TvListItemComponent);
