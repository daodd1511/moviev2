import { memo } from 'react';

import { Link } from 'react-router-dom';

import { Tv } from '../../../models/';

import { IMAGE_BASE_URL } from '../../constants';
import { PosterSizes } from '../../enums';
import { formatToYear } from '../../utils';
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
    <Link
      to={`/tv/detail/${tv.id}`}
      className="group block h-fit pb-4 transition-all hover:scale-105 hover:rounded-lg hover:bg-slate-700 hover:text-white"
    >
      <img
        src={imageURL}
        alt={`${tv.name} image`}
        className="rounded-lg shadow-2xl group-hover:rounded-bl-none group-hover:rounded-br-none"
      />
      <p className="text-md p-2 pb-4 text-center">{tv.name}</p>
      <div className="flex justify-evenly">
        <div className="flex items-center rounded-lg border border-gray-300 px-2 py-1 text-center text-sm">
          {formatToYear(tv.firstAirDate)}
        </div>
        <div className="ml-2 rounded-lg border border-gray-300 p-2 text-center text-sm">
          {tv.voteAverage.toFixed(1)}
        </div>
      </div>
    </Link>
  );
};

export const TvListItem = memo(TvListItemComponent);
