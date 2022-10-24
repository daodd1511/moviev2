import { TvDto } from '../../dtos/tv/tv.dto';
import { Tv } from '../../models/tv/tv.model';

export namespace TvMapper {

  /**
   * Maps TvDto to Tv model.
   * @param dto Tv dto.
   */
  export function fromDto(dto: TvDto): Tv {
    return new Tv({
      id: dto.id,
      overview: dto.overview,
      posterPath: dto.poster_path,
      backdropPath: dto.backdrop_path,
      popularity: dto.popularity,
      voteAverage: dto.vote_average,
      voteCount: dto.vote_count,
      originalLanguage: dto.original_language,
      genreIds: dto.genre_ids,
      firstAirDate: dto.first_air_date,
      name: dto.name,
      originalName: dto.original_name,
      originCountry: dto.origin_country,
    });
  }
}
