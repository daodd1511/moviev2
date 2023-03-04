import { MovieDto, TvDto } from '../dtos';

import { Media } from '@/models';

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
    });
  }
}
