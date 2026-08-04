import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Credits, Media, MovieDetail, Pagination } from '@/models';
import { MovieService } from '@/api/services/movieService';

export namespace MovieQueries {
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

  export const useCredits = (id: number) =>
    useQuery<Credits, AxiosError>({
      queryKey: ['movieCredits', id],
      queryFn: () => MovieService.getCredits(id),
    });
}
