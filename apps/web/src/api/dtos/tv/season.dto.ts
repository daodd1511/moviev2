/** Season dto. */
export interface SeasonDto {

  /** Air date. */
  readonly air_date: string;

  /** Episode count. */
  readonly episode_count: number;

  /** Id. */
  readonly id: number;

  /** Name. */
  readonly name: string;

  /** Overview. */
  readonly overview: string;

  /** Poster path. */
  readonly poster_path: string | null;

  /** Season number. */
  readonly season_number: number;
}
