import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Credits, Genre, Media, MovieDetail, Pagination } from '@/models';
import { MovieService } from '@/api/services/movieService';
import { MovieQueryParams } from '@/models/movie/movieQueryParams.model';

export namespace MovieQueries {
  export const useInfiniteListByDiscover = (discoverValue: string) =>
    useInfiniteQuery<
      Pagination<Media>,
      AxiosError,
      InfiniteData<Pagination<Media>, number>,
      readonly [string, string],
      number
    >({
      queryKey: ['movies', discoverValue],
      queryFn: ({ pageParam }) => MovieService.getMovies(pageParam, discoverValue),
      initialPageParam: 1,
      getNextPageParam(lastPage) {
        const nextPage = lastPage.page + 1;
        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    });

  export const useInfiniteListTest = (params: MovieQueryParams) =>
    useInfiniteQuery<
      Pagination<Media>,
      AxiosError,
      InfiniteData<Pagination<Media>, number>,
      readonly [string, MovieQueryParams],
      number
    >({
      queryKey: ['movies', params],
      queryFn: ({ pageParam }) => MovieService.getTestMovies(pageParam, params),
      initialPageParam: 1,
      getNextPageParam(lastPage) {
        const nextPage = lastPage.page + 1;
        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    });

  export const useTestInfiniteListByDiscover = (params: MovieQueryParams) =>
    useInfiniteQuery<
      Pagination<Media>,
      AxiosError,
      InfiniteData<Pagination<Media>, number>,
      readonly [string, MovieQueryParams],
      number
    >({
      queryKey: ['movies', params],
      queryFn: ({ pageParam }) => MovieService.getTestMovies(pageParam, params),
      initialPageParam: 1,
      getNextPageParam(lastPage) {
        const nextPage = lastPage.page + 1;
        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    });

  export const useDetail = (id: number) =>
    useQuery<MovieDetail, AxiosError>({
      queryKey: ['movieDetail', id],
      queryFn: () => MovieService.getMovieDetail(id),
    });

  export const useRecommendations = (id: number) =>
    useQuery<Pagination<Media>, AxiosError>({
      queryKey: ['movieRecommendations', id],
      queryFn: () => MovieService.getMovieRecommendations(id),
    });

  export const useGenres = () =>
    useQuery<readonly Genre[], AxiosError>({
      queryKey: ['movieGenres'],
      queryFn: () => MovieService.getGenres(),
    });

  export const useCredits = (id: number) =>
    useQuery<Credits, AxiosError>({
      queryKey: ['movieCredits', id],
      queryFn: () => MovieService.getCredits(id),
    });
}
