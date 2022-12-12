import { MovieQueryParamsDto } from '@/api/dtos/movie/movieQueryParams.dto';
import { MovieQueryParams } from '@/models/movie/movieQueryParams.model';

export namespace MovieQueryParamsMapper {

  /**
   * Map query params to dto.
   * @param params Query params.
   */
  export function toDto(params: MovieQueryParams): MovieQueryParamsDto {
    const sortValue = `${params.sortBy}.${params.sortOrder}`;
    const genresValue = (params.withGenres != null) ? params.withGenres.join(',') : '';
    const yearValue = (params.year != null) ? params.year : '';
    const releaseDateGteValue = (params.releaseDateGte != null) ? params.releaseDateGte.toISOString() : '';
    const releaseDateLteValue = (params.releaseDateLte != null) ? params.releaseDateLte.toISOString() : '';
    return {
      'page': params.page,
      'sort_by': sortValue,
      'with_genres': genresValue,
      'year': yearValue,
      'release_date.gte': releaseDateGteValue,
      'release_date.lte': releaseDateLteValue,
    };
  }
}
