import { TvDetailMapper } from '../../core/mappers/tv/tvDetail.mapper';
import { TvDetailDto } from '../../core/dtos/tv/tvDetail.dto';
import { TvDto } from '../../core/dtos/tv/tv.dto';
import { TvMapper } from '../../core/mappers/tv/tv.mapper';
import { api } from '..';
import { PaginationDto, GenreResponseDto } from '../../core/dtos';
import { PaginationMapper, GenreMapper } from '../../core/mappers';
import { Genre, Pagination, TvDetail } from '../../core/models';
import { Tv } from '../../core/models/tv/tv.model';

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
    const response = await api.get<TvDetailDto>(`/tv/${tvId}`);
    const tv = TvDetailMapper.fromDto(response.data);
    return tv;
  };

  export const searchTvs = async(query: string): Promise<Pagination<Tv>> => {
    const response = await api.get<PaginationDto<TvDto>>(`/search/tv?query=${query}`);
    const tvs = PaginationMapper.fromDto(response.data, tvDto => TvMapper.fromDto(tvDto));
    return tvs;
  };

  export const getTvRecommendation = (tvId: number): Promise<Pagination<Tv>> => getTvs(1, `${tvId}/recommendations`);
}
