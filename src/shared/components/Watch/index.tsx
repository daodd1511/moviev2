import { memo, useState, useEffect, useRef } from 'react';

import { Select } from './Select';

import { PLAYER_PROVIDERS, PlayerProvider, getMoviePlayerSrc, getTvPlayerSrc } from './getPlayerSource';

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
  const [playerSrc, setPlayerSrc] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState(PLAYER_PROVIDERS[0]);
  if (isTvShow && episode === null && select.current !== null) {
    if (media.seasons.length > 0) {
      select.current.scrollIntoView({ behavior: 'smooth' });
    }
  }
  const onChangeProvider = (provider: PlayerProvider) => {
    setActiveProvider(provider);
    const source = isTvShow ?
      getTvPlayerSrc(provider, media.id, season, episode) :
      getMoviePlayerSrc(provider, media.id);
    setPlayerSrc(source);
  };

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
    const src = isTvShow ? getTvPlayerSrc(activeProvider, media.id, season, episode) : getMoviePlayerSrc(activeProvider, media.id);
    setPlayerSrc(src);
  }, [media.id]);

  useEffect(() => {
    if (player.current !== null) {
      player.current.scrollIntoView({ behavior: 'smooth' });
    }

    if (isTvShow) {
      const src = getTvPlayerSrc(activeProvider, media.id, season, episode);
      setPlayerSrc(src);
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
      <div className="pt-10 flex justify-center gap-6">
        {PLAYER_PROVIDERS.map((provider, index) => (
          <button key={provider.name} onClick={() => onChangeProvider(provider)} className={`btn ${activeProvider === provider ? 'btn-primary text-white' : 'btn-outline'}`}>
            Provider {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export const Watch = memo(WatchComponent);
