import { queryOptions, useQueries, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Credits, Media, Pagination, SeasonDetail, TvDetail } from '@/models';
import { TvService } from '@/api/services/tvService';

export namespace TvQueries {
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

  /** Shared cache contract for a single season-detail request. */
  export const seasonDetailOptions = (id: number, seasonNumber: number) =>
    queryOptions<SeasonDetail, AxiosError>({
      queryKey: ['tvSeasonDetail', id, seasonNumber],
      queryFn: () => TvService.getSeasonDetail(id, seasonNumber),
    });

  /** Reads one season through the reusable season-detail cache contract. */
  export const useSeasonDetail = (id: number, seasonNumber: number) =>
    useQuery(seasonDetailOptions(id, seasonNumber));

  /** Reads independent season-detail queries while preserving their requested order. */
  export const useSeasonDetails = (id: number, seasonNumbers: readonly number[]) =>
    useQueries({
      queries: seasonNumbers.map(seasonNumber => seasonDetailOptions(id, seasonNumber)),
    });

  export const useCredits = (id: number) =>
    useQuery<Credits, AxiosError>({
      queryKey: ['tvCredits', id],
      queryFn: () => TvService.getCredits(id),
    });
}
