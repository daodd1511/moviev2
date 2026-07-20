import { MovieQueryParamsDto } from '@/api/dtos/movie/movieQueryParams.dto';
import { MovieQueryParams } from '@/models/movie/movieQueryParams.model';

export namespace MovieQueryParamsMapper {

  /**
   * Map query params to dto.
   * @param params Query params.
   */
  export function toDto(params: MovieQueryParams): MovieQueryParamsDto {
    const pageValue = (params.page !== null) ? params.page : 1;
    const sortValue = `${params.sortBy}.${params.sortOrder}`;
    const genresValue = (params.withGenres !== undefined) ? params.withGenres.join(',') : '';
    const yearValue = (params.year !== undefined) ? params.year : '';
    const releaseDateGteValue = (params.releaseDateGte !== undefined) ? params.releaseDateGte.toISOString() : '';
    const releaseDateLteValue = (params.releaseDateLte !== undefined) ? params.releaseDateLte.toISOString() : '';
    const voteCountGteValue = (params.voteCountGte !== undefined) ? params.voteCountGte : 0;
    return {
      'page': pageValue,
      'sort_by': sortValue,
      'with_genres': genresValue,
      'year': yearValue,
      'release_date.gte': releaseDateGteValue,
      'release_date.lte': releaseDateLteValue,
      'vote_count.gte': voteCountGteValue,
    };
  }
}
