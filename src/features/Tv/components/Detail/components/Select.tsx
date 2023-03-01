import { ChangeEvent, memo } from 'react';

import { Season } from '@/models';
import { TvQueries } from '@/stores/queries/tvQueries';

interface Props {

  /** Season number. */
  readonly season: number;

  /** Episode data. */
  readonly episode: number;

  /** Set season number. */
  readonly setSeason: (season: number) => void;

  /** Set episode number. */
  readonly setEpisode: (episode: number) => void;

  /** Tv id. */
  readonly tvId: number;

  /** Total seasons of tv show. */
  readonly seasons: readonly Season[];
}

const SelectComponent = ({
  season,
  episode,
  setEpisode,
  setSeason,
  tvId,
  seasons,
}: Props) => {
  const { data: episodes } = TvQueries.useSeasonDetail(tvId, season);
  const onSeasonChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value !== undefined) {
      setSeason(parseInt(event.target.value, 10));
    }
    if (
      event.target.value !== undefined &&
      parseInt(event.target.value, 10) === -1
    ) {
      setEpisode(-1);
    }
  };

  const onEpisodeButtonClick = (episodeNumber: number) => {
    setEpisode(episodeNumber);
  };
  return (
    <div className="mt-6 w-full rounded-lg px-6 py-10 shadow-2xl">
      <select
        value={season}
        onChange={onSeasonChange}
        className="select select-bordered"
      >
        <option value={-1}>Select season</option>
        {seasons.map(
          item =>
            item.seasonNumber !== 0 && (
              <option key={item.id} value={item.seasonNumber}>
                Season {item.seasonNumber}
              </option>
            ),
        )}
      </select>
      <div className="grid grid-cols-autoFit py-5">
        {episodes?.map(ep => (
          <button
            type="button"
            key={ep.id}
            className={`${
              episode === ep.episodeNumber ?
                'bg-blue-700 text-white' :
                'bg-gray-100 text-gray-900 hover:text-blue-700  '
            } mr-2 mb-2 rounded-lg border border-gray-200 py-2.5 px-5 text-sm focus:outline-none  `}
            onClick={() => onEpisodeButtonClick(ep.episodeNumber)}
          >
            <b>Eps {ep.episodeNumber}</b>: {ep.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Select = memo(SelectComponent);
