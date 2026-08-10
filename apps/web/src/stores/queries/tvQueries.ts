import { useQuery } from '@tanstack/react-query';
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

  export const useSeasonDetail = (id: number, seasonNumber: number) =>
    useQuery<SeasonDetail, AxiosError>({
      queryKey: ['tvSeasonDetail', id, seasonNumber],
      queryFn: () => TvService.getSeasonDetail(id, seasonNumber),
    });

  export const useCredits = (id: number) =>
    useQuery<Credits, AxiosError>({
      queryKey: ['tvCredits', id],
      queryFn: () => TvService.getCredits(id),
    });
}
