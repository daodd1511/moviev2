/** Movie Dto. */
export interface MovieDto {

  /** Poster path. */
  readonly poster_path: string | null;

  /** Poster path. */
  readonly adult: boolean;

  /** Overview. */
  readonly overview: string;

  /** Release date. */
  readonly release_date: string;

  /** Genre ids. */
  readonly genre_ids: number[];

  /** Id. */
  readonly id: number;

  /** Original title. */
  readonly original_title: string;

  /** Original language. */
  readonly original_language: string;

  /** Title. */
  readonly title: string;

  /** Backdrop path. */
  readonly backdrop_path: string | null;

  /** Popularity. */
  readonly popularity: number;

  /** Vote count. */
  readonly vote_count: number;

  /** Vote average. */
  readonly vote_average: number;
}
