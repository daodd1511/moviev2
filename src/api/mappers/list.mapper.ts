import { ListDto } from '../dtos/list.dto';

import { MovieMapper } from './movie/movie.mapper';

import { TvMapper } from './tv/tv.mapper';

import { MediaMapper } from './media.mapper';

import { List, Movie, Tv } from '@/models';

export namespace ListMapper {

  /**
   * Maps ListDto to List model.
   * @param dto List dto.
   */
  export function fromDto(dto: ListDto): List {
    return new List({
      id: dto._id,
      name: dto.name,
      description: dto.description,
      movies: dto.movies.length > 0 ? dto.movies.map(movie => MediaMapper.fromMovieDto(movie)) : [],
      tvShows: dto.tvShows.length > 0 ? dto.tvShows.map(tv => MediaMapper.fromTvDto(tv)) : [],
      createAt: new Date(dto.createAt),
      updateAt: new Date(dto.updateAt),
    });
  }

  /**
   * Maps List model to ListDto.
   * @param list List model.
   */
  export function toDto(list: List): ListDto {
    return {
      name: list.name,
      description: list.description,
      movies: list.movies.map(movie => MovieMapper.toDto(movie as Movie)),
      tvShows: list.tvShows.map(tv => TvMapper.toDto(tv as Tv)),
    } as unknown as ListDto;
  }
}
