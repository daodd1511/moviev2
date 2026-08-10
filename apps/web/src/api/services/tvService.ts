import { api } from '..';
import { PaginationDto, SeasonDetailDto, TvDetailDto, TvDto, CreditsDto } from '../dtos';
import {
  PaginationMapper,
  SeasonDetailMapper,
  TvDetailMapper,
  TvMapper,
  CastMapper,
  CrewMapper,
} from '../mappers';

import { MediaMapper } from '../mappers/media.mapper';

import { Pagination, SeasonDetail, TvDetail, Tv, Media, Credits } from '@/models';

export namespace TvService {
  export const getTvs = async (
    page: number,
    discoverValue?: string,
  ): Promise<Pagination<Media>> => {
    const response = await api.get<PaginationDto<TvDto>>(
      `/tv/${discoverValue ?? 'popular'}?page=${page}`,
    );
    const tvs = PaginationMapper.fromDto(response.data, tvDto => MediaMapper.fromTvDto(tvDto));
    return tvs;
  };

  export const getTvDetail = async (tvId: number | undefined): Promise<TvDetail> => {
    if (tvId === undefined) {
      return [] as unknown as TvDetail;
    }
    const response = await api.get<TvDetailDto>(`/tv/${tvId}`, {
      params: { append_to_response: 'videos' },
    });
    const tv = TvDetailMapper.fromDto(response.data);
    return tv;
  };

  export const searchTvs = async (query: string): Promise<Pagination<Tv>> => {
    const response = await api.get<PaginationDto<TvDto>>(`/search/tv?query=${query}`);
    const tvs = PaginationMapper.fromDto(response.data, tvDto => TvMapper.fromDto(tvDto));
    return tvs;
  };

  export const getTvRecommendation = (tvId: number): Promise<Pagination<Media>> =>
    getTvs(1, `${tvId}/recommendations`);

  export const getSeasonDetail = async (
    tvId: number,
    seasonNumber: number,
  ): Promise<SeasonDetail> => {
    const { data: season } = await api.get<SeasonDetailDto>(
      `/tv/${tvId}/season/${seasonNumber}`,
    );
    return SeasonDetailMapper.fromDto(season);
  };

  export const getCredits = async (tvId: number): Promise<Credits> => {
    const response = await api.get<CreditsDto>(`/tv/${tvId}/credits`);
    const creditsData = response.data;

    return {
      cast: creditsData.cast.map(cast => CastMapper.fromDto(cast)),
      crew: creditsData.crew.map(crew => CrewMapper.fromDto(crew)),
    };
  };
}
