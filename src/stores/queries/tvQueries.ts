import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Episode, Genre, Pagination, Tv, TvDetail } from '@/models';
import { TvService } from '@/api/services/tvService';

export namespace TvQueries {
  export const useInfiniteListByDiscover = (discover: string | undefined) =>
    useInfiniteQuery<Pagination<Tv>, AxiosError>(
      [`${discover ?? ''}tv`, discover],
      ({ pageParam = 1 }) => TvService.getTvs(pageParam, discover),
      {
        getNextPageParam(lastPage) {
          const nextPage = lastPage.page + 1;
          return nextPage < lastPage.totalPages ? nextPage : undefined;
        },
      },
    );

  export const useInfiniteListByGenre = (genreId: number) =>
    useInfiniteQuery<Pagination<Tv>, AxiosError>(
      [`tvByGenre${genreId}`, genreId],
      ({ pageParam = 1 }) => TvService.getTvsByGenre(genreId, pageParam),
      {
        getNextPageParam(lastPage) {
          const nextPage = lastPage.page + 1;
          return nextPage < lastPage.totalPages ? nextPage : undefined;
        },
      },
    );

  export const useDetail = (id: number) =>
    useQuery<TvDetail, AxiosError>(['tvDetail', id], () =>
      TvService.getTvDetail(id));

  export const useRecommendations = (id: number) =>
    useQuery<Pagination<Tv>, AxiosError>(['movieRecommendations', id], () =>
      TvService.getTvRecommendation(id));

  export const useGenres = () =>
    useQuery<readonly Genre[], AxiosError>(['tvGenres'], () =>
      TvService.getGenres());

  export const useSeasonDetail = (id: number, seasonNumber: number) => useQuery<readonly Episode[], AxiosError>(
    ['seasonEpisode', id, seasonNumber],
    () => TvService.getSeasonDetail(id, seasonNumber),
    { enabled: seasonNumber !== -1 },
  );
}
