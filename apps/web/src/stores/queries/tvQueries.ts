import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Credits, Episode, Media, Pagination, TvDetail } from '@/models';
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
