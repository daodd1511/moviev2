import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { Genre, TvDetail } from '../../../models';

import { Buttons } from './Buttons';

interface Props {

  /** Tv detail. */
  readonly tv: TvDetail;

  /** Set is watch tv state. */
  readonly setIsWatchTv: (isWatchTv: boolean) => void;

  /** Watch button disable state. */
  readonly isWatchButtonDisabled: boolean;
}

const ContentComponent = ({ tv, setIsWatchTv, isWatchButtonDisabled }: Props) => {
  const navigate = useNavigate();
  const onGenreClick = (genre: Genre) => {
    navigate(`/tv/genre/${genre.id}`);
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
      </div>
      <div className="pb-8">
        <h3 className="mb-2 text-lg font-medium">Genres</h3>
        <ul className="flex gap-2">
          {tv.genres.map(genre => (
            <li
              key={genre.id}
              className="align-center ease flex w-max cursor-pointer rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-500 transition duration-300 active:bg-gray-300"
              onClick={() => onGenreClick(genre)}
            >
              {genre.name}
            </li>
          ))}
        </ul>
      </div>
      <div className="pb-6">
        <h3 className="mb-2 text-lg font-medium">Synopsys</h3>
        <p className="font-light">{tv.overview}</p>
      </div>
      <Buttons tv={tv} setIsWatchTv={setIsWatchTv} isWatchButtonDisabled={isWatchButtonDisabled}/>
    </>
  );
};

export const Content = memo(ContentComponent);
