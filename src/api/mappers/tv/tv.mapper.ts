import { TvDto } from '../../dtos/';

import { Tv } from '@/models';

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

  /**
   * Maps Tv model to TvDto.
   * @param tv Tv model.
   */
  export function toDto(tv: Tv): TvDto {
    return {
      id: tv.id,
      overview: tv.overview,
      poster_path: tv.posterPath,
      backdrop_path: tv.backdropPath,
      popularity: tv.popularity,
      vote_average: tv.voteAverage,
      vote_count: tv.voteCount,
      original_language: tv.originalLanguage,
      genre_ids: tv.genreIds,
      first_air_date: tv.firstAirDate,
      name: tv.name,
      original_name: tv.originalName,
      origin_country: tv.originCountry,
    };
  }
}
