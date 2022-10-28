import { memo } from 'react';

import { Link } from 'react-router-dom';

import { IMAGE_BASE_URL } from '../../../core/constants';
import { PosterSizes } from '../../../core/enums';
import { Tv } from '../../../core/models/tv/tv.model';
import { formatToYear } from '../../../core/utils';
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
    <Link to={`/tv/detail/${tv.id}`} className="h-fit hover:scale-105 transition-all pb-4 hover:bg-slate-700 hover:text-white hover:rounded-lg block group">
      <img src={imageURL} alt={`${tv.name} image`} className="rounded-lg group-hover:rounded-bl-none group-hover:rounded-br-none shadow-2xl" />
      <p className="text-md p-2 pb-4 text-center">{tv.name}</p>
      <div className="flex justify-evenly">
        <div className="flex items-center text-center text-sm px-2 py-1 border border-gray-300 rounded-lg">{formatToYear(tv.firstAirDate)}</div>
        <div className="text-center text-sm ml-2 p-2 border border-gray-300 rounded-lg">{tv.voteAverage.toFixed(1)}</div>
      </div>
    </Link>
  );
};

export const TvListItem = memo(TvListItemComponent);
