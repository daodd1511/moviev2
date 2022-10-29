import { SeasonMapper, TvMapper, VideoMapper, GenreMapper } from '..';

import { TvDetailDto } from '../../dtos';

import { TvDetail } from '../../../models/';

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
      videos: dto.videos.results.map(video => VideoMapper.fromDto(video)),
    });
  }
}
