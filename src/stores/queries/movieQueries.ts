import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Genre, Movie, MovieDetail, Pagination } from '@/models';
import { MovieService } from '@/api/services/movieService';
import { MovieQueryParams } from '@/models/movie/movieQueryParams.model';

export namespace MovieQueries {
  export const useInfiniteListByDiscover = (
    discoverValue: string,
  ) =>
    useInfiniteQuery<Pagination<Movie>, AxiosError>(
      ['movies', discoverValue],
      ({ pageParam = 1 }) => MovieService.getMovies(pageParam, discoverValue),
      {
        getNextPageParam(lastPage) {
          const nextPage = lastPage.page + 1;
          return nextPage < lastPage.totalPages ? nextPage : undefined;
        },
      },
    );

  export const useTestInfiniteListByDiscover = (
      params: MovieQueryParams,
  ) =>
      useInfiniteQuery<Pagination<Movie>, AxiosError>(
      ['movies', params],
      ({ pageParam = 1 }) => MovieService.getTestMovies(pageParam, params),
      {
          getNextPageParam(lastPage) {
            const nextPage = lastPage.page + 1;
            return nextPage < lastPage.totalPages ? nextPage : undefined;
          },
      },
    );

  export const useInfiniteListByGenre = (genreId: number) => useInfiniteQuery<Pagination<Movie>, AxiosError>(
    [`moviesByGenre${genreId}`, genreId],
    ({ pageParam = 1 }) => MovieService.getMoviesByGenre(genreId, pageParam),
    {
        getNextPageParam(lastPage) {
          const nextPage = lastPage.page + 1;
          return nextPage < lastPage.totalPages ? nextPage : undefined;
        },
    },
  );

  export const useDetail = (id: number) =>
    useQuery<MovieDetail, AxiosError>(['movieDetail', id], () =>
      MovieService.getMovieDetail(id));

  export const useRecommendations = (id: number) =>
    useQuery<Pagination<Movie>, AxiosError>(['movieRecommendations', id], () =>
      MovieService.getMovieRecommendations(id));

  export const useGenres = () =>
    useQuery<readonly Genre[], AxiosError>(['movieGenres'], () => MovieService.getGenres());

}
