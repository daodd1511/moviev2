import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Movie, MovieDetail, Pagination } from '@/models';
import { MovieService } from '@/api/services/movieService';

export namespace MovieQueries {
  export const useInfiniteListByDiscover = (
    discover: string | undefined,
  ) =>
    useInfiniteQuery<Pagination<Movie>, AxiosError>(
      [`${discover ?? ''}movies`, discover],
      ({ pageParam = 1 }) => MovieService.getMovies(pageParam, discover),
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
    useQuery(['movieGenres'], () => MovieService.getGenres());

}
