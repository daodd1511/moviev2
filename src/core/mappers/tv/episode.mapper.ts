import { EpisodeDto } from '../../dtos/tv/episode.dto';
import { Episode } from '../../models/tv/episode.model';

export namespace EpisodeMapper {

  /**
   * Maps EpisodeDto to Episode model.
   * @param dto Episode dto.
   */
  export function fromDto(dto: EpisodeDto): Episode {
    return new Episode({
      airDate: dto.air_date,
      id: dto.id,
      name: dto.name,
      overview: dto.overview,
      episodeNumber: dto.episode_number,
    });
  }
}
