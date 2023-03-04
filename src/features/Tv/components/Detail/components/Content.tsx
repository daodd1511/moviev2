import { memo, useState } from 'react';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Buttons } from './Buttons';

import { TvDetail } from '@/models';
import { formatToYear } from '@/shared/utils';
import { MediaMapper } from '@/api/mappers/media.mapper';
import { Menu } from '@/shared/components/List/Menu';

interface Props {

  /** Tv detail. */
  readonly tv: TvDetail;
}

const ContentComponent = ({ tv }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const onListMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <>
      <div className="pb-8">
        <h1 className="mb-2 text-5xl font-extralight text-slate-700">
          {tv.name.toUpperCase()}
        </h1>
        <h2 className="text-lg font-bold text-slate-700">
          {tv.tagline.toUpperCase()}
        </h2>
        <h3 className="text-slate-400">
          {tv.voteAverage.toFixed(1)} / {formatToYear(tv.firstAirDate)}
        </h3>
        <div className="relative pt-4">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cPrimary text-sm text-white"
            onClick={onListMenuClick}
          >
            <FontAwesomeIcon icon={faList} />
          </button>
          <Menu
            media={MediaMapper.fromTv(tv)}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            className="shadow-xl"
          />
        </div>
      </div>
      <div className="pb-8">
        <h3 className="mb-2 text-lg font-medium">Genres</h3>
        <ul className="flex gap-2">
          {tv.genres.map(genre => (
            <li
              key={genre.id}
              className="align-center ease flex w-max cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-500 transition duration-300 active:bg-gray-300"
            >
              {genre.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="pb-6">
        <h3 className="mb-2 text-lg font-medium">Overview</h3>
        <p className="font-light">{tv.overview}</p>
      </div>
      <Buttons tv={tv}/>
    </>
  );
};

export const Content = memo(ContentComponent);
