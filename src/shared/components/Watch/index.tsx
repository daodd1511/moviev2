import { memo, useState, useEffect, useRef } from 'react';

import { Select } from './Select';

import { API_CONFIG } from '@/api/config';
import { MovieDetail, TvDetail } from '@/models';
import { StorageService } from '@/api/services/storageService';
import { LOCAL_STORAGE_KEY } from '@/shared/constants';
import { goToTop } from '@/shared/utils';

interface TvStorage {

  /** Id. */
  id: TvDetail['id'];

  /** Season. */
  season: number;

  /** Episode. */
  episode: number;
}

// TODO: Make player a service
const getMoviePlayerSrc = (id: MovieDetail['id']) =>
  `${API_CONFIG.videoApiUrl}/${id}/color-023246`;
const getTvPlayerSrc = (
  id: TvDetail['id'],
  season: number,
  episode: number | null,
) =>
  episode !== null ?
    `${API_CONFIG.videoApiUrl}/${id}/${season}-${episode}/color-023246` :
    null;
const getStorageKey = (id: TvDetail['id']) =>
  `${LOCAL_STORAGE_KEY.watchTV}_${id}`;

interface Props {

  /** Media value. */
  readonly media: TvDetail | MovieDetail;
}

const WatchComponent = ({ media }: Props) => {
  const player = useRef<HTMLDivElement | null>(null);
  const select = useRef<HTMLDivElement | null>(null);
  const isTvShow = media instanceof TvDetail;
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number | null>(null);
  if (isTvShow && episode === null && select.current !== null) {
    if (media.seasons.length > 0) {
      select.current.scrollIntoView({ behavior: 'smooth' });
    }
  }
  const playerSrc = isTvShow ?
    getTvPlayerSrc(media.id, season, episode) :
    getMoviePlayerSrc(media.id);
  useEffect(() => {
    if (isTvShow) {
      const storageKey = getStorageKey(media.id);
      const mediaFromStorage = StorageService.get<TvStorage>(storageKey);
      if (mediaFromStorage !== null) {
        const {
          id,
          season: storageSeason,
          episode: storageEpisode,
        } = mediaFromStorage;
        if (media.id === id) {
          setSeason(storageSeason);
          setEpisode(storageEpisode);
        }
      }
    }
    goToTop();
  }, [media.id]);

  useEffect(() => {
    if (player.current !== null) {
      player.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [episode]);

  return (
    <div className="pt-10">
      {playerSrc !== null && (
        <div ref={player} className="z-10">
          <iframe
            src={playerSrc}
            width="100%"
            height="100%"
            allowFullScreen={true}
            className="aspect-video"
          />
        </div>
      )}
      {isTvShow && (
        <div ref={select}>
          <Select
            season={season}
            episode={episode}
            setSeason={setSeason}
            setEpisode={setEpisode}
            seasons={media.seasons}
            tvId={media.id}
            storageKey={getStorageKey(media.id)}
          />
        </div>
      )}
    </div>
  );
};

export const Watch = memo(WatchComponent);
