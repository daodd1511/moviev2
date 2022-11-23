/** List dto. */
export interface ListDto {

  /** List id. */
  readonly _id: string;

  /** List name. */
  readonly name: string;

  /** List description. */
  readonly description: string;

  /** Movie items. */
  readonly movies: number[];

  /** Tv items. */
  readonly tvShows: number[];

  /** Create at. */
  readonly createAt: string;

  /** Update at. */
  readonly updateAt: string;
}
