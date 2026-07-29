import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Credits, Episode, Genre, Media, Pagination, Tv, TvDetail } from '@/models';
import { TvService } from '@/api/services/tvService';

export namespace TvQueries {
  export const useInfiniteListByDiscover = (discover: string | undefined) =>
    useInfiniteQuery<
      Pagination<Media>,
      AxiosError,
      InfiniteData<Pagination<Media>, number>,
      readonly [string, string | undefined],
      number
    >({
      queryKey: [`${discover ?? ''}tv`, discover],
      queryFn: ({ pageParam }) => TvService.getTvs(pageParam, discover),
      initialPageParam: 1,
      getNextPageParam(lastPage) {
        const nextPage = lastPage.page + 1;
        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    });

  export const useInfiniteListByGenre = (genreId: number) =>
    useInfiniteQuery<
      Pagination<Tv>,
      AxiosError,
      InfiniteData<Pagination<Tv>, number>,
      readonly [string, number],
      number
    >({
      queryKey: [`tvByGenre${genreId}`, genreId],
      queryFn: ({ pageParam }) => TvService.getTvsByGenre(genreId, pageParam),
      initialPageParam: 1,
      getNextPageParam(lastPage) {
        const nextPage = lastPage.page + 1;
        return nextPage < lastPage.totalPages ? nextPage : undefined;
      },
    });

  export const useDetail = (id: number) =>
    useQuery<TvDetail, AxiosError>({
      queryKey: ['tvDetail', id],
      queryFn: () => TvService.getTvDetail(id),
    });

  export const useRecommendations = (id: number) =>
    useQuery<Pagination<Media>, AxiosError>({
      queryKey: ['movieRecommendations', id],
      queryFn: () => TvService.getTvRecommendation(id),
    });

  export const useGenres = () =>
    useQuery<readonly Genre[], AxiosError>({
      queryKey: ['tvGenres'],
      queryFn: () => TvService.getGenres(),
    });

  export const useSeasonDetail = (id: number, seasonNumber: number) =>
    useQuery<readonly Episode[], AxiosError>({
      queryKey: ['seasonEpisode', id, seasonNumber],
      queryFn: () => TvService.getSeasonDetail(id, seasonNumber),
      enabled: seasonNumber !== -1,
    });

  export const useCredits = (id: number) =>
    useQuery<Credits, AxiosError>({
      queryKey: ['tvCredits', id],
      queryFn: () => TvService.getCredits(id),
    });
}
