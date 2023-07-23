import { API_CONFIG } from '@/api/config';
import { MovieDetail, TvDetail } from '@/models';

/** Player provider. */
export interface PlayerProvider {

  /** Name of the provider. */
  name: string;

  /** Url of the provider. */
  url: string;
}

const vidSrcProvider: PlayerProvider = {
  name: 'vidsrc',
  url: API_CONFIG.videoApiProvider1,
};

const superEmbedProvider: PlayerProvider = {
  name: 'superembed',
  url: API_CONFIG.videoApiProvider2,
};

const movieApiProvider: PlayerProvider = {
  name: 'movieapi',
  url: API_CONFIG.videoApiProvider3,
};

const smashyStreamProvider: PlayerProvider = {
  name: 'smashystream',
  url: API_CONFIG.videoApiProvider4,
};

export const PLAYER_PROVIDERS: PlayerProvider[] = [
  vidSrcProvider,
  superEmbedProvider,
  movieApiProvider,
  smashyStreamProvider,
];

export const getMoviePlayerSrc = (provider: PlayerProvider, id: MovieDetail['id']) => {
  switch (provider.name) {
    case vidSrcProvider.name:
      return `${provider.url}/movie?tmdb=${id}&color=023246`;
    case superEmbedProvider.name:
      return `${provider.url}&video_id=${id}`;
    case movieApiProvider.name:
      return `${provider.url}/movie/${id}`;
    case smashyStreamProvider.name:
      return `${provider.url}?tmdb=${id}`;
    default:
      return '';
  }
};
export const getTvPlayerSrc = (
  provider: PlayerProvider,
  id: TvDetail['id'],
  season: number,
  episode: number | null,
) => {
  if (episode === null) {
    return null;
  }

  switch (provider.name) {
    case vidSrcProvider.name:
      return `${provider.url}/tv?tmdb=${id}&season=${season}&episode=${episode}&color=023246`;
    case superEmbedProvider.name:
      return `${provider.url}&video_id=${id}&s=${season}&e=${episode}`;
    case movieApiProvider.name:
      return `${provider.url}/tv/${id}-${season}-${episode}`;
    case smashyStreamProvider.name:
      return `${provider.url}?tmdb=${id}&season=${season}&episode=${episode}`;
    default:
      return '';
  }
};
