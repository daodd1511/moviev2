import { api } from '..';
import { PaginationDto, GenreResponseDto, EpisodeDto, TvDetailDto, TvDto } from '../dtos';
import { PaginationMapper, GenreMapper, EpisodeMapper, TvDetailMapper, TvMapper } from '../mappers';

import { Episode, Genre, Pagination, TvDetail, Tv } from '@/models';

export namespace TvService {
  export const getTvs = async(page: number, discoverValue?: string): Promise<Pagination<Tv>> => {
    const response = await api.get<PaginationDto<TvDto>>(`/tv/${discoverValue ?? 'popular'}?page=${page}`);
    const tvs = PaginationMapper.fromDto(response.data, tvDto => TvMapper.fromDto(tvDto));
    return tvs;
  };

  export const getGenres = async(): Promise<readonly Genre[]> => {
    const response = await api.get<GenreResponseDto>('/genre/tv/list');
    const genres = response.data.genres.map(genreDto => GenreMapper.fromDto(genreDto));
    return genres;
  };

  export const getTvsByGenre = async(genreId: number, page: number): Promise<Pagination<Tv>> => {
    const response = await api.get<PaginationDto<TvDto>>(`/discover/tv?with_genres=${genreId}&page=${page}`);
    const tvs = PaginationMapper.fromDto(response.data, tvDto => TvMapper.fromDto(tvDto));
    return tvs;
  };

  export const getTvDetail = async(tvId: number | undefined): Promise<TvDetail> => {
    if (tvId === undefined) {
      return [] as unknown as TvDetail;
    }
    const response = await api.get<TvDetailDto>(`/tv/${tvId}`, { params: { append_to_response: 'videos' } });
    const tv = TvDetailMapper.fromDto(response.data);
    return tv;
  };

  export const searchTvs = async(query: string): Promise<Pagination<Tv>> => {
    const response = await api.get<PaginationDto<TvDto>>(`/search/tv?query=${query}`);
    const tvs = PaginationMapper.fromDto(response.data, tvDto => TvMapper.fromDto(tvDto));
    return tvs;
  };

  export const getTvRecommendation = (tvId: number): Promise<Pagination<Tv>> => getTvs(1, `${tvId}/recommendations`);

  export const getSeasonDetail = async(tvId: number | undefined, seasonNumber: number | undefined): Promise<readonly Episode[]> => {
    if (tvId === undefined || seasonNumber === undefined) {
      return [] as unknown as Episode[];
    }
    const { data: season } = await api.get<{ readonly episodes: readonly EpisodeDto[]; }>(`/tv/${tvId}/season/${seasonNumber}`);
    return season.episodes.map(episodeDto => EpisodeMapper.fromDto(episodeDto));
  };
}
