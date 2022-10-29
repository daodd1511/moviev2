import { SeasonDto } from '../../dtos/';

import { Season } from '../../../models/';

export namespace SeasonMapper {

  /**
   * Maps SeasonDto to Season model.
   * @param dto Season dto.
   */
  export function fromDto(dto: SeasonDto): Season {
    return new Season({
      airDate: dto.air_date,
      episodeCount: dto.episode_count,
      id: dto.id,
      name: dto.name,
      overview: dto.overview,
      posterPath: dto.poster_path,
      seasonNumber: dto.season_number,

    });
  }
}
