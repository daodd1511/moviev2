import { TvDetail } from '../../models/tv/tvDetail.model';
import { TvDetailDto } from '../../dtos/tv/tvDetail.dto';

import { GenreMapper } from '../genre.mapper';

import { TvMapper } from './tv.mapper';
import { SeasonMapper } from './season.mapper';

export namespace TvDetailMapper {

  /**
   * Maps TvDto to Tv model.
   * @param dto Tv dto.
   */
  export function fromDto(dto: TvDetailDto): TvDetail {
    return new TvDetail({
      ...TvMapper.fromDto(dto),
      seasons: dto.seasons.map(season => SeasonMapper.fromDto(season)),
      tagline: dto.tagline,
      genres: dto.genres.map(genre => GenreMapper.fromDto(genre)),
    });
  }
}
