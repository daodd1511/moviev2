import { api } from '..';
import { PaginationDto, MovieDto, GenreResponseDto, MovieDetailDto } from '../../core/dtos';
import { Type } from '../../core/enums';
import { PaginationMapper, MovieMapper, GenreMapper, MovieDetailMapper } from '../../core/mappers';
import { Movie, Genre, Pagination, MovieDetail } from '../../core/models';

export namespace MovieService {
  export const getMovies = async(page: number, discoverValue?: string): Promise<Pagination<Movie>> => {
    const response = await api.get<PaginationDto<MovieDto>>(`/movie/${discoverValue ?? 'popular'}?page=${page}`);
    const movies = PaginationMapper.fromDto(response.data, movieDto => MovieMapper.fromDto(movieDto));
    return movies;
  };

  export const getGenres = async(type: Type): Promise<readonly Genre[]> => {
    const response = await api.get<GenreResponseDto>(`/genre/${type}/list`);
    const genres = response.data.genres.map(genreDto => GenreMapper.fromDto(genreDto));
    return genres;
  };

  export const getMoviesByGenre = async(genreId: number, page: number): Promise<Pagination<Movie>> => {
    const response = await api.get<PaginationDto<MovieDto>>(`/discover/movie?with_genres=${genreId}&page=${page}`);
    const movies = PaginationMapper.fromDto(response.data, movieDto => MovieMapper.fromDto(movieDto));
    return movies;
  };

  export const getMovieDetail = async(movieId: number | undefined): Promise<MovieDetail> => {
    if (movieId === undefined) {
      return [] as unknown as MovieDetail;
    }
    const response = await api.get<MovieDetailDto>(`/movie/${movieId}`);
    const movie = MovieDetailMapper.fromDto(response.data);
    return movie;
  };

  export const searchMovies = async(query: string): Promise<Pagination<Movie>> => {
    const response = await api.get<PaginationDto<MovieDto>>(`/search/movie?query=${query}`);
    const movies = PaginationMapper.fromDto(response.data, movieDto => MovieMapper.fromDto(movieDto));
    return movies;
  };

  export const getMovieRecommendation = (movieId: number): Promise<Pagination<Movie>> => getMovies(1, `${movieId}/recommendations`);
}
