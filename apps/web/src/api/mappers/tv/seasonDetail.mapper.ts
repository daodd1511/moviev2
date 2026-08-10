import { EpisodeMapper } from './episode.mapper';

import { SeasonDetailDto } from '../../dtos';

import { SeasonDetail } from '@/models';

/** Maps TMDB season detail DTOs to domain models. */
export namespace SeasonDetailMapper {
  /**
   * Maps a season detail DTO and its episodes to a SeasonDetail model.
   * @param dto TMDB season detail response.
   */
  export function fromDto(dto: SeasonDetailDto): SeasonDetail {
    return new SeasonDetail({
      airDate: dto.air_date,
      episodes: dto.episodes.map(episode => EpisodeMapper.fromDto(episode)),
      id: dto.id,
      name: dto.name,
      overview: dto.overview,
      posterPath: dto.poster_path,
      seasonNumber: dto.season_number,
    });
  }
}
