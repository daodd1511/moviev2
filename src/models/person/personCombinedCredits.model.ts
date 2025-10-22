/** Person combined credits model. */
export interface PersonCombinedCredits {
  /** Id. */
  readonly id: number;

  /** Cast. */
  readonly cast: readonly CombinedCredit[];

  /** Crew. */
  readonly crew: readonly CombinedCredit[];
}

/** Combined credit model. */
export interface CombinedCredit {
  /** Id. */
  readonly id: number;

  /** Original language. */
  readonly originalLanguage: string | null;

  /** Episode count. */
  readonly episodeCount: number;

  /** Overview. */
  readonly overview: string;

  /** Origin country. */
  readonly originCountry: readonly string[];

  /** Original name. */
  readonly originalName: string;

  /** Vote count. */
  readonly voteCount: number;

  /** Name. */
  readonly name: string;

  /** Media type. */
  readonly mediaType: string;

  /** Popularity. */
  readonly popularity: number;

  /** Credit ID. */
  readonly creditId: string;

  /** Backdrop path. */
  readonly backdropPath: string | null;

  /** First air date. */
  readonly firstAirDate: string;

  /** Vote average. */
  readonly voteAverage: number;

  /** Genre IDs. */
  readonly genreIds: readonly number[];

  /** Poster path. */
  readonly posterPath: string | null;

  /** Original title. */
  readonly originalTitle: string;

  /** Video. */
  readonly video: boolean;

  /** Title. */
  readonly title: string;

  /** Adult. */
  readonly adult: boolean;

  /** Release date. */
  readonly releaseDate: string;

  /** Character. */
  readonly character: string;

  /** Gender. */
  readonly gender: number;

  /** Job. */
  readonly job: string;
}