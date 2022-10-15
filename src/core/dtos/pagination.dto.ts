
/** Pagination dto. */
export interface PaginationDto<T> {

  /** Result page. */
  readonly page: number;

  /** Results data. */
  readonly results: T[];

  /** Total results. */
  readonly total_results: number;

  /** Total pages. */
  readonly total_pages: number;
}
