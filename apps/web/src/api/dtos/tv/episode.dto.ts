/** Episode dto. */
export interface EpisodeDto {
  /** Air date. */
  readonly air_date: string | null;

  /** Episode number. */
  readonly episode_number: number;

  /** Id. */
  readonly id: number;

  /** Name. */
  readonly name: string;

  /** Overview. */
  readonly overview: string;

  /** Runtime in minutes. */
  readonly runtime: number | null;

  /** Episode still path. */
  readonly still_path: string | null;

  /** Public TMDB vote average. */
  readonly vote_average: number;
}
