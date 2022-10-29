/** Tv dto. */
export interface TvDto {

  /** Poster path. */
  readonly poster_path: string | null;

  /** Popularity. */
  readonly popularity: number;

  /** Id. */
  readonly id: number;

  /** Backdrop path. */
  readonly backdrop_path: string | null;

  /** Vote average. */
  readonly vote_average: number;

  /** Overview. */
  readonly overview: string;

  /** First air date. */
  readonly first_air_date: string;

  /** Origin country. */
  readonly origin_country: string[];

  /** Genre ids. */
  readonly genre_ids: number[];

  /** Original language. */
  readonly original_language: string;

  /** Vote count. */
  readonly vote_count: number;

  /** Name. */
  readonly name: string;

  /** Original name. */
  readonly original_name: string;
}
