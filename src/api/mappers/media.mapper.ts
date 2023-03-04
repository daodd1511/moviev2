import { MovieDto, TvDto } from '../dtos';

import { Media, Movie, Tv } from '@/models';
import { MediaType } from '@/shared/enums/mediaType';

export namespace MediaMapper {

  /**
   * Maps MovieDto to Media model.
   * @param dto Movie dto.
   */
  export function fromMovieDto(dto: MovieDto): Media {
    return new Media({
      id: dto.id,
      posterPath: dto.poster_path,
      releaseDate: dto.release_date,
      title: dto.title,
      voteAverage: dto.vote_average,
      type: MediaType.Movie,
    });
  }

  /**
   * Maps Movie to Media model.
   * @param mlovie Movie.
   * @param movie
   */
  export function fromMovie(movie: Movie): Media {
    return new Media({
      id: movie.id,
      posterPath: movie.posterPath,
      releaseDate: movie.releaseDate,
      title: movie.title,
      voteAverage: movie.voteAverage,
      type: MediaType.Movie,
    });
  }

  /**
   * Maps TvDto to Media model.
   * @param dto Tv dto.
   */
  export function fromTvDto(dto: TvDto): Media {
    return new Media({
      id: dto.id,
      posterPath: dto.poster_path,
      releaseDate: dto.first_air_date,
      title: dto.name,
      voteAverage: dto.vote_average,
      type: MediaType.Tv,
    });
  }

  /**
   * Maps Tv to Media model.
   * @param tv Tv.
   */
  export function fromTv(tv: Tv): Media {
    return new Media({
      id: tv.id,
      posterPath: tv.posterPath,
      releaseDate: tv.firstAirDate,
      title: tv.name,
      voteAverage: tv.voteAverage,
      type: MediaType.Tv,
    });
  }
}
