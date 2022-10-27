import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ChangeEvent, memo } from 'react';

import { TvService } from '../../../api/services/tvService';
import { TvDetail } from '../../../core/models';
import { Episode } from '../../../core/models/tv/episode.model';

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
  readonly tvId: number | undefined;

  /** Tv data. */
  readonly tv: TvDetail;
}

const SelectComponent = ({
  season,
  episode,
  setEpisode,
  setSeason,
  tvId,
  tv,
}: Props) => {
  const { data: episodes } = useQuery<readonly Episode[], AxiosError>(
    ['seasonEpisode', tvId, season],
    () => TvService.getSeasonDetail(tvId, season),
    { enabled: season !== -1 },
  );
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

  const onEpisodeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value !== undefined) {
      setEpisode(parseInt(event.target.value, 10));
    }
  };
  return (
    <div className="my-5 flex h-12 w-full overflow-clip">
      <select
        value={season}
        onChange={onSeasonChange}
        className="w-40 rounded-lg bg-transparent p-2 focus:outline-none"
      >
        <option value={-1}>Select season</option>
        {tv.seasons.map(item =>
            item.seasonNumber !== 0 && (
            <option key={item.id} value={item.seasonNumber}>
                  Season {item.seasonNumber}
            </option>
          ))}
      </select>
      <select
        value={episode}
        onChange={onEpisodeChange}
        className="flex-1 rounded-lg bg-transparent p-2 focus:outline-none"
      >
        <option value={-1}>Select episodes</option>
        {season !== -1 &&
          episodes !== undefined &&
          episodes.map(ep => (
            <option key={ep.id} value={ep.episodeNumber}>
              Episode {ep.episodeNumber}: {ep.name}
            </option>
          ))}
      </select>
    </div>
  );
};

export const Select = memo(SelectComponent);
