import { MovieDto } from '../../dtos/movie/movie.dto';
import { Movie } from '../../models/movie/movie.model';

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
}
