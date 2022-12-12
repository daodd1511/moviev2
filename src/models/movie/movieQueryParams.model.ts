import { SortBy, SortOrder } from '@/shared/enums/sort';

/** Movie query params model. */
export interface MovieQueryParams {

  /** Page. */
  readonly page?: number;

  /** Sort by. */
  readonly sortBy: SortBy;

  /** Sort order. */
  readonly sortOrder: SortOrder;

  /** Genres. */
  readonly withGenres?: string[];

  /** Year. */
  readonly year?: string;

  /** Greater than release date. */
  readonly releaseDateGte?: Date;

  /** Less than release date. */
  readonly releaseDateLte?: Date;

  /** Greater than vote count. */
  readonly voteCountGte?: number;
}
