/** Person combined credits DTO. */
export interface PersonCombinedCreditsDto {

  /** Id. */
  readonly id: number;

  /** Cast. */
  readonly cast: readonly CombinedCreditDto[];

  /** Crew. */
  readonly crew: readonly CombinedCreditDto[];
}

/** Combined credit DTO. */
export interface CombinedCreditDto {

  /** Id. */
  readonly id: number;

  /** Original language. */
  readonly original_language: string | null;

  /** Episode count. */
  readonly episode_count: number;

  /** Overview. */
  readonly overview: string;

  /** Origin country. */
  readonly origin_country: readonly string[];

  /** Original name. */
  readonly original_name: string;

  /** Vote count. */
  readonly vote_count: number;

  /** Name. */
  readonly name: string;

  /** Media type. */
  readonly media_type: string;

  /** Popularity. */
  readonly popularity: number;

  /** Credit ID. */
  readonly credit_id: string;

  /** Backdrop path. */
  readonly backdrop_path: string | null;

  /** First air date. */
  readonly first_air_date: string;

  /** Vote average. */
  readonly vote_average: number;

  /** Genre IDs. */
  readonly genre_ids: readonly number[];

  /** Poster path. */
  readonly poster_path: string | null;

  /** Original title. */
  readonly original_title: string;

  /** Video. */
  readonly video: boolean;

  /** Title. */
  readonly title: string;

  /** Adult. */
  readonly adult: boolean;

  /** Release date. */
  readonly release_date: string;

  /** Character. */
  readonly character: string;

  /** Gender. */
  readonly gender: number;

  /** Job. */
  readonly job: string;
}
