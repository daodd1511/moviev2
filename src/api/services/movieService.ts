import { api } from '..';
import { PaginationDto, MovieDto, GenreResponseDto } from '../../core/dtos';
import { Type } from '../../core/enums';
import { PaginationMapper, MovieMapper, GenreMapper } from '../../core/mappers';
import { Movie, Genre, Pagination } from '../../core/models';

export namespace MovieService {
  export const getMovies = async(discoverValue?: string): Promise<Pagination<Movie>> => {
    const response = await api.get<PaginationDto<MovieDto>>(`/movie/${discoverValue ?? 'popular'}`);
    const movies = PaginationMapper.fromDto(response.data, movieDto => MovieMapper.fromDto(movieDto));
    return movies;
  };

  export const getGenres = async(type: Type): Promise<readonly Genre[]> => {
    const response = await api.get<GenreResponseDto>(`/genre/${type}/list`);
    const genres = response.data.genres.map(genreDto => GenreMapper.fromDto(genreDto));
    return genres;
  };
}
