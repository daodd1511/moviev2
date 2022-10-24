import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { ChangeEvent, memo } from 'react';

import { TvService } from '../../../api/services/tvService';
import { TvDetail } from '../../../core/models';
import { Episode } from '../../../core/models/tv/episode.model';

interface Props {

  /** Season number. */
  readonly seasonNumber: number;

  /** Episode data. */
  readonly episodeNumber: number;

  /** Set season number. */
  readonly setSeasonNumber: (seasonNumber: number) => void;

  /** Set episode number. */
  readonly setEpisodeNumber: (episodeNumber: number) => void;

  /** Tv id. */
  readonly tvId: number | undefined;

  /** Tv data. */
  readonly tv: TvDetail;
}

const SelectComponent = ({
  seasonNumber,
  episodeNumber,
  setEpisodeNumber,
  setSeasonNumber,
  tvId,
  tv,
}: Props) => {
  const { data: episodes } = useQuery<readonly Episode[], AxiosError>(
    ['seasonEpisode', tvId, seasonNumber],
    () => TvService.getSeasonDetail(tvId, seasonNumber),
    { enabled: seasonNumber !== -1 },
  );
  const onSeasonChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value !== undefined) {
      setSeasonNumber(parseInt(event.target.value, 10));
    }
    if (
      event.target.value !== undefined &&
      parseInt(event.target.value, 10) === -1
    ) {
      setEpisodeNumber(-1);
    }
  };

  const onEpisodeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value !== undefined) {
      setEpisodeNumber(parseInt(event.target.value, 10));
    }
  };
  return (
    <div className="my-5 flex h-12 w-full overflow-clip">
      <select
        value={seasonNumber}
        onChange={onSeasonChange}
        className="w-40 rounded-lg bg-transparent p-2 focus:outline-none"
      >
        <option value={-1}>Select season</option>
        {tv.seasons.map(season =>
            season.seasonNumber !== 0 && (
            <option key={season.id} value={season.seasonNumber}>
                  Season {season.seasonNumber}
            </option>
          ))}
      </select>
      <select
        value={episodeNumber}
        onChange={onEpisodeChange}
        className="flex-1 rounded-lg bg-transparent p-2 focus:outline-none"
      >
        <option value={-1}>Select episodes</option>
        {seasonNumber !== -1 &&
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
