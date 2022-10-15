import { api } from '..';
import { MovieDto } from '../../core/dtos/movie/movie.dto';
import { PaginationDto } from '../../core/dtos/pagination.dto';
import { MovieMapper } from '../../core/mappers/movie/movie.mapper';
import { PaginationMapper } from '../../core/mappers/pagination.mapper';
import { Movie } from '../../core/models/movie/movie.model';

export namespace MovieService {
  export const getMovies = async(): Promise<readonly Movie[]> => {
    const response = await api.get<PaginationDto<MovieDto>>('/discover/movie');
    const movies = PaginationMapper.fromDto(response.data, movieDto => MovieMapper.fromDto(movieDto));
    return movies.results;
  };
}
