import { MovieDto } from '../../dtos';

import { Movie } from '@/models';

export namespace MovieMapper {

  /**
   * Maps MovieDto to Movie model.
   * @param dto Movie dto.
   */
  export function fromDto(dto: MovieDto): Movie {
    return new Movie({
      id: dto.id,
      title: dto.title,
      overview: dto.overview,
      releaseDate: dto.release_date,
      posterPath: dto.poster_path,
      backdropPath: dto.backdrop_path,
      popularity: dto.popularity,
      voteAverage: dto.vote_average,
      voteCount: dto.vote_count,
      adult: dto.adult,
      originalLanguage: dto.original_language,
      originalTitle: dto.original_title,
      genreIds: dto.genre_ids,
    });
  }

  /**
   * Maps Movie model to MovieDto.
   * @param movie Movie model.
   */
  export function toDto(movie: Movie): MovieDto {
    return {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      release_date: movie.releaseDate,
      poster_path: movie.posterPath,
      backdrop_path: movie.backdropPath,
      popularity: movie.popularity,
      vote_average: movie.voteAverage,
      vote_count: movie.voteCount,
      adult: movie.adult,
      original_language: movie.originalLanguage,
      original_title: movie.originalTitle,
      genre_ids: movie.genreIds,
    };
  }
}
