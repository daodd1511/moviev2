import { api } from '..';
import { PaginationDto, MovieDto, GenreResponseDto, MovieDetailDto } from '../dtos';
import { PaginationMapper, MovieMapper, GenreMapper, MovieDetailMapper } from '../mappers';

import { MovieQueryParamsMapper } from '../mappers/movie/movieQueryParams.mapper';

import { MediaMapper } from '../mappers/media.mapper';

import { Movie, Genre, Pagination, MovieDetail, Media } from '@/models';
import { MovieQueryParams } from '@/models/movie/movieQueryParams.model';

export namespace MovieService {

  export const getMovies = async(page: number, discoverValue?: string): Promise<Pagination<Media>> => {
    const response = await api.get<PaginationDto<MovieDto>>(`/movie/${discoverValue ?? 'popular'}?page=${page}`);
    const movies = PaginationMapper.fromDto(response.data, movieDto => MediaMapper.fromMovieDto(movieDto));
    return movies;
  };

  export const getTestMovies = async(page: number, params: MovieQueryParams): Promise<Pagination<Movie>> => {
    const paramsDto = MovieQueryParamsMapper.toDto({ ...params, page });
    const response = await api.get<PaginationDto<MovieDto>>('/discover/movie', { params: paramsDto });
    const movies = PaginationMapper.fromDto(response.data, movieDto => MovieMapper.fromDto(movieDto));
    return movies;
  };

  export const getGenres = async(): Promise<readonly Genre[]> => {
    const response = await api.get<GenreResponseDto>('/genre/movie/list');
    const genres = response.data.genres.map(genreDto => GenreMapper.fromDto(genreDto));
    return genres;
  };

  export const getMovieDetail = async(movieId: number | undefined): Promise<MovieDetail> => {
    if (movieId === undefined) {
      return [] as unknown as MovieDetail;
    }
    const response = await api.get<MovieDetailDto>(`/movie/${movieId}`, { params: { append_to_response: 'videos' } });
    const movie = MovieDetailMapper.fromDto(response.data);
    return movie;
  };

  export const searchMovies = async(query: string): Promise<Pagination<Movie>> => {
    const response = await api.get<PaginationDto<MovieDto>>(`/search/multi?query=${query}`);
    const movies = PaginationMapper.fromDto(response.data, movieDto => MovieMapper.fromDto(movieDto));
    return movies;
  };

  export const getMovieRecommendations = (movieId: number): Promise<Pagination<Media>> => getMovies(1, `${movieId}/recommendations`);
}
