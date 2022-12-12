/** Movie query params. */
export interface MovieQueryParamsDto {

  /** Page. */
  readonly page: number;

  /** Sort by. */
  readonly sort_by: string;

  /** Genres. */
  readonly with_genres?: string;

  /** Year. */
  readonly year?: string;

  /** Greater than release date. */
  readonly 'release_date.gte'?: string;

  /** Less than release date. */
  readonly 'release_date.lte'?: string;

  /** Greater than vote count. */
  readonly 'vote_count.gte'?: number;
}
