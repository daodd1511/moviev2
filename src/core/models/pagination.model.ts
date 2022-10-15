import { Immerable, OmitImmerable } from '../immerable';

/** Pagination. */
export class Pagination<T> extends Immerable {
  /** Result page. */
  public readonly page: number;

  /** Total results.*/
  public readonly totalResults: number;

  /** Total pages.*/
  public readonly totalPages: number;

  /** Array of data objects. */
  public readonly results: readonly T[];

  public constructor(data: InitArgsPagination<T>) {
    super();
    this.page = data.page;
    this.totalResults = data.totalResults;
    this.totalPages = data.totalPages;
    this.results = data.results;
  }
}
type InitArgsPagination<T> = OmitImmerable<Pagination<T>>;
