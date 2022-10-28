import { MovieDetail } from '../../models/movie/movieDetail.model';
import { MovieDetailDto } from '../../dtos/movie/movieDetail.dto';
import { GenreMapper } from '../genre.mapper';
import { SpokenLangMapper } from '../spokenLang.mapper';
import { MovieMapper, VideoMapper } from '..';

export namespace MovieDetailMapper {

  /**
   * Maps MovieDto to Movie model.
   * @param dto Movie dto.
   */
  export function fromDto(dto: MovieDetailDto): MovieDetail {
    return new MovieDetail({
      ...MovieMapper.fromDto(dto),
      budget: dto.budget,
      genres: dto.genres.map(genre => GenreMapper.fromDto(genre)),
      homepage: dto.homepage,
      imdbId: dto.imdb_id,
      revenue: dto.revenue,
      runtime: dto.runtime,
      spokenLanguages: dto.spoken_languages.map(lang => SpokenLangMapper.fromDto(lang)),
      status: dto.status,
      tagline: dto.tagline,
      video: dto.video,
      videos: dto.videos.results.map(video => VideoMapper.fromDto(video)),
    });
  }
}
